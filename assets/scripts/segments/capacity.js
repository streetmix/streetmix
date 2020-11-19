import { parse } from 'json2csv'
import { DEFAULT_CAPACITY_SOURCE } from '../streets/constants'
import {
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL
} from './constants'
import SOURCE_DATA from './capacity.json'

const BASE_DATA_SOURCE = 'common'
const CAPACITIES = processCapacityData()

/**
 * When this module is initialized, process SOURCE_DATA:
 * - Each data source should inherit values from "common".
 * - Each segment with inherited values should inherit those values
 * - Add a special source for "none". This can be used as a backup
 *   in case a source is specified but it no longer exists or becomes
 *   removed in the future. Code that works with the entire capacity
 *   source object should handle the "none" case manually.
 */
function processCapacityData () {
  const processed = {
    // Disabled; let's force use of capacity data for now.
    // none: {
    //   source_author: '(none)',
    //   id: 'none'
    // }
  }
  const sourceKeys = Object.keys(SOURCE_DATA)
  for (let i = 0; i < sourceKeys.length; i++) {
    const sourceKey = sourceKeys[i]
    const data = SOURCE_DATA[sourceKey]

    // Skip the "common" data source from processing
    if (data.id === BASE_DATA_SOURCE) continue

    processed[sourceKey] = {
      ...data,
      segments: {
        // Clone "common" segments into our processed definition
        ...SOURCE_DATA[BASE_DATA_SOURCE].segments,
        // Iterate through source segment data and process each.
        ...processInheritedValues(data.segments)
      }
    }
  }

  return processed
}

/**
 * Utility function for processing inherited values. Accepts an object
 * whose keys are segments and values are objects. If the value contains
 * the "inherits" property it will replace the value with inherited values.
 * Otherwise the object data is passed through.
 *
 * @param {Object} definitions - object to process
 * @param {Object} inheritSource - optional source of inherited values
 */
function processInheritedValues (definitions, inheritSource) {
  const processed = {}
  const source = inheritSource || definitions
  const keys = Object.keys(definitions)
  for (let j = 0; j < keys.length; j++) {
    const key = keys[j]
    const segment = definitions[key]

    // Process inherited segments
    // Processed segments clone original data to prevent
    // other code from modifying the source
    let clone
    if (segment.inherits) {
      clone = {
        ...source[segment.inherits]
      }
    } else {
      clone = {
        ...segment
      }
    }

    // Process variants, if present
    if (segment.variants) {
      clone.variants = processInheritedValues(segment.variants, definitions)
    }

    processed[key] = clone
  }
  return processed
}

export function getAllCapacityDataSources () {
  return CAPACITIES
}

export function getCapacityData (source = DEFAULT_CAPACITY_SOURCE) {
  return CAPACITIES[source]
}

/**
 * Given a segment, and an optional data source, return capacity information
 * if available. If no capacity information is defined, returns `null`.
 * If a capacity is defined, there are some cases where the capacity for
 * a specific segment will be dropped to zero. This can happen if the
 * segment is located outside of the street, or if the segment is too
 * small. We may, in the future, handle other cases that affect capacity,
 * such as segment width or adjacent segment types.
 *
 * @param {Object} segment - the segment object to retrieve capacity for
 * @param {string} source - data source ID to use
 * @returns {Object} capacity information (or null if not defined)
 */
export function getSegmentCapacity (segment, source) {
  let capacity = getCapacityData(source).segments[segment.type]

  // If definition has variants, use that instead
  if (capacity?.variants && segment.variant) {
    Object.entries(segment.variant).forEach((entry) => {
      const key = entry.join(':')
      if (capacity.variants[key]) {
        capacity = capacity.variants[key]
      }
    })
  }

  // If a segment has capacity data, but something makes it zero capacity,
  // return modified values here.
  if (
    capacity &&
    segment?.warnings &&
    (segment.warnings[SEGMENT_WARNING_OUTSIDE] ||
      segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL])
  ) {
    return {
      average: 0,
      potential: 0
    }
  }

  if (capacity) {
    return {
      // Temporary: map minimum values to average
      average: capacity.average ?? capacity.minimum ?? undefined,
      // Temporary: map undefined potential values from average
      potential: capacity.potential ?? capacity.average ?? undefined
    }
  }

  // Returns null value if capacity is not defined
  return null
}

/**
 * Given a street, calculate how much capacity the entire street is capable of
 * supporting, by summing up the capacity available on each segment.
 *
 * @param {Object} street - street data
 * @returns {Object} capacity information. Unlike segment capacity, this will
 *  always return an object. Values are set to zero if street has no capacity.
 */
export function getStreetCapacity (street) {
  const { segments, capacitySource } = street
  const segmentCapacities = segments.map((segment) =>
    getSegmentCapacity(segment, capacitySource)
  )

  const sum = (total, num) => {
    if (!Number.isInteger(num)) return total
    return total + num
  }

  const average = segmentCapacities
    .map((capacity) => capacity?.average || 0)
    .reduce(sum, 0)
  const potential = segmentCapacities
    .map((capacity) => capacity?.potential || 0)
    .reduce(sum, 0)

  return {
    average,
    potential
  }
}

/**
 * Given a street, calculate the capacity for each type of segment, rolling
 * up identical segment types together.
 *
 * @param {Object} street - the street to get summary capacity from
 * @returns {Array} capacities - sorted array of segment types and capacities
 */
export function getRolledUpSegmentCapacities (street) {
  const { segments, capacitySource } = street
  const capacities = segments
    // Iterate through each segment to determine its capacity
    .map((segment) => ({
      type: segment.type,
      capacity: getSegmentCapacity(segment, capacitySource)
    }))
    // Drop all segments without capacity information
    .filter((segment) => segment.capacity !== null)
    // Combine capacity values of segments of the same type
    .reduce((accumulator, { type, capacity }) => {
      accumulator[type] = mergeCapacity(accumulator[type], capacity)
      return accumulator
    }, {})

  // Convert object back to array and sort, first by increasing
  // average, then by increasing potential
  return Object.keys(capacities)
    .map((key) => ({
      type: key,
      capacity: capacities[key]
    }))
    .sort(sortByCapacity)
}

function mergeCapacity (a = {}, b) {
  return {
    average: (a.average || 0) + b.average,
    potential: (a.potential || 0) + b.potential
  }
}

function sortByCapacity (a, b) {
  const a1 = a.capacity.average
  const b1 = b.capacity.average
  const a2 = a.capacity.potential
  const b2 = b.capacity.potential

  if (a1 < b1) return -1
  if (a1 > b1) return 1
  if (a2 < b2) return -1
  if (a2 > b2) return 1

  return 0
}

/**
 * Converts capacity data into a CSV file for exporting
 *
 * @param {Array} data - capacity data from getRolledUpSegmentCapacities()
 * @param {string} streetName - string for file name
 */
export function saveCsv (data, streetName) {
  const fields = ['type', 'averageCapacity', 'potentialCapacity']
  const opts = { fields }
  const formattedData = data.map((row) => ({
    type: row.type,
    averageCapacity: row.capacity.average,
    potentialCapacity: row.capacity.potential
  }))

  try {
    const csv = parse(formattedData, opts)
    const downloadLink = document.createElement('a')
    const blob = new Blob(['\ufeff', csv])
    const url = URL.createObjectURL(blob)

    downloadLink.href = url
    downloadLink.download = `${streetName}_capacity.csv`

    document.body.appendChild(downloadLink)
    downloadLink.click()
  } catch (err) {
    console.error(err)
  }
}
