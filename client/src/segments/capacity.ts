import { Parser } from '@json2csv/plainjs'

import { omit } from '../util/omit'
import { DEFAULT_CAPACITY_SOURCE } from '../streets/constants'
import {
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL
} from './constants'
import SOURCE_DATA from './capacity_data.json'

import type {
  CapacityData,
  CapacityForDisplay,
  CapacitySegmentDefinition,
  CapacitySegments,
  CapacitySourceDefinition,
  Segment,
  StreetState
} from '@streetmix/types'

const BASE_DATA_SOURCE = 'common'
const CAPACITIES = processCapacityData()

interface SegmentCapacities {
  type: string
  capacity: CapacityForDisplay
}

/**
 * When this module is initialized, process SOURCE_DATA:
 * - Each data source should inherit values from "common".
 * - Each segment with inherited values should inherit those values
 * - Add a special source for "none". This can be used as a backup
 *   in case a source is specified but it no longer exists or becomes
 *   removed in the future. Code that works with the entire capacity
 *   source object should handle the "none" case manually.
 */
function processCapacityData (): CapacityData {
  const processed: CapacityData = {}
  const baseData = SOURCE_DATA[BASE_DATA_SOURCE]
  const sourceData = omit(SOURCE_DATA, [BASE_DATA_SOURCE]) as CapacityData

  const sourceKeys = Object.keys(sourceData)
  for (let i = 0; i < sourceKeys.length; i++) {
    const sourceKey = sourceKeys[i]
    const data = sourceData[sourceKey]

    processed[sourceKey] = {
      ...data,
      segments: {
        // Clone "common" segments into our processed definition
        ...baseData.segments,
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
function processInheritedValues (
  definitions: CapacitySegments,
  inheritSource?: CapacitySegments
): CapacitySegments {
  const processed: CapacitySegments = {}
  const source = inheritSource ?? definitions
  const keys = Object.keys(definitions)
  for (let j = 0; j < keys.length; j++) {
    const key = keys[j]
    const segment = definitions[key]

    // Process inherited segments
    // Processed segments clone original data to prevent
    // other code from modifying the source
    let clone
    if (segment.inherits !== undefined) {
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

export function getAllCapacityDataSources (): CapacityData {
  return CAPACITIES
}

export function getCapacityData (
  source = DEFAULT_CAPACITY_SOURCE
): CapacitySourceDefinition {
  return CAPACITIES[source]
}

/**
 * Given a segment, and an optional data source, return capacity information
 * if available. If no capacity information is defined, returns `undefined`.
 * If a capacity is defined, there are some cases where the capacity for
 * a specific segment will be dropped to zero. This can happen if the
 * segment is located outside of the street, or if the segment is too
 * small. We may, in the future, handle other cases that affect capacity,
 * such as segment width or adjacent segment types.
 */
export function getSegmentCapacity (
  segment: Segment,
  source: string = DEFAULT_CAPACITY_SOURCE
): CapacityForDisplay | undefined {
  let capacity = getCapacityData(source).segments[segment.type]

  // Returns undefined value if capacity is not defined
  if (capacity === undefined) {
    return
  }

  // If definition has variants, use that instead
  if (capacity.variants && segment.variant !== undefined) {
    Object.entries(segment.variant).forEach((entry) => {
      const key = entry.join(':')
      if (capacity.variants?.[key]) {
        capacity = capacity.variants[key]
      }
    })
  }

  // If a segment has capacity data, but something makes it zero capacity,
  // return modified values here.
  if (
    segment.warnings[SEGMENT_WARNING_OUTSIDE] ||
    segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL]
  ) {
    return {
      average: 0,
      potential: 0
    }
  }

  return {
    // Temporary: map minimum values to average
    average: capacity.average ?? capacity.minimum ?? 0,
    // Temporary: map undefined potential values from average
    potential: capacity.potential ?? capacity.average ?? 0
  }
}

/**
 * Given a street, calculate how much capacity the entire street is capable of
 * supporting, by summing up the capacity available on each segment. Unlike
 * segment capacity, this will always return an object. Values are set to zero
 * if street has no capacity data.
 */
export function getStreetCapacity (
  street: StreetState
): CapacitySegmentDefinition {
  const { segments, capacitySource } = street
  const segmentCapacities = segments.map((segment: Segment) =>
    getSegmentCapacity(segment, capacitySource)
  )

  const sum = (total: number, num: number): number => {
    return total + num
  }

  const average = segmentCapacities
    .map((capacity) => capacity?.average ?? 0)
    .reduce(sum, 0)
  const potential = segmentCapacities
    .map((capacity) => capacity?.potential ?? 0)
    .reduce(sum, 0)

  return {
    average,
    potential
  }
}

/**
 * Given a street, calculate the capacity for each type of segment, rolling
 * up identical segment types together.
 */
export function getRolledUpSegmentCapacities (
  street: StreetState
): SegmentCapacities[] {
  const { segments, capacitySource } = street
  const capacities = segments
    // Iterate through each segment to determine its capacity
    .map((segment: Segment): SegmentCapacities | null => {
      const capacity = getSegmentCapacity(segment, capacitySource)

      if (capacity === undefined) {
        return null
      }

      return {
        type: segment.type,
        capacity
      }
    })
    // Drop all segments without capacity information
    .filter((segment: SegmentCapacities | null) => segment !== null)
    // Combine capacity values of segments of the same type
    .reduce(
      (accumulator: Record<string, CapacityForDisplay>, { type, capacity }) => {
        accumulator[type] = mergeCapacity(accumulator[type], capacity)
        return accumulator
      },
      {}
    )

  // Convert object back to array and sort, first by increasing
  // average, then by increasing potential
  return Object.keys(capacities)
    .map((key) => ({
      type: key,
      capacity: capacities[key]
    }))
    .sort(sortByCapacity)
}

function mergeCapacity (
  a: Partial<CapacityForDisplay> = {},
  b: Partial<CapacityForDisplay> = {}
): CapacityForDisplay {
  return {
    average: (a.average ?? 0) + (b.average ?? 0),
    potential: (a.potential ?? 0) + (b.potential ?? 0)
  }
}

function sortByCapacity (a: SegmentCapacities, b: SegmentCapacities): number {
  const a1 = a.capacity?.average ?? 0
  const b1 = b.capacity?.average ?? 0
  const a2 = a.capacity?.potential ?? 0
  const b2 = b.capacity?.potential ?? 0

  if (a1 < b1) return -1
  if (a1 > b1) return 1
  if (a2 < b2) return -1
  if (a2 > b2) return 1

  return 0
}

export function getCsv (data: SegmentCapacities[]): string {
  const fields = ['type', 'averageCapacity', 'potentialCapacity']
  const opts = { fields }
  const formattedData = data.map((row) => ({
    type: row.type,
    averageCapacity: row.capacity?.average ?? 0,
    potentialCapacity: row.capacity?.potential ?? 0
  }))

  const parser = new Parser(opts)
  const csv = parser.parse(formattedData)

  return csv
}

/**
 * Converts capacity data into a CSV file for exporting
 */
export function saveCsv (data: SegmentCapacities[], streetName: string): void {
  try {
    const csv = getCsv(data)
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
