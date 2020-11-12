import { getSegmentVariantInfo, getSegmentInfo } from '../segments/info'
import SOURCE_DATA from '../segments/capacity.json'
import {
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL
} from '../segments/constants'
const { parse } = require('json2csv')

const csvTransform = (item) => {
  return {
    type: item.type,
    averageCapacity: item.capacity.average,
    potentialCapacity: item.capacity.potential
  }
}

export const saveCsv = (rows, streetName) => {
  const fields = ['type', 'averageCapacity', 'potentialCapacity']
  const opts = { fields }

  const formattedData = rows.map(csvTransform)

  try {
    const csv = parse(formattedData, opts)
    const downloadLink = document.createElement('a')
    const blob = new Blob(['\ufeff', csv])
    const url = URL.createObjectURL(blob)

    downloadLink.href = url
    downloadLink.download = `${streetName} capacity.csv`

    document.body.appendChild(downloadLink)
    downloadLink.click()
  } catch (err) {
    console.error(err)
  }
}

// take in a street and returns a list of segments with analytics info
const getAnalyticsFromStreet = (street, locale) => {
  const segments = street.segments.map((segment) => {
    const variant = (
      getSegmentVariantInfo(segment.type, segment.variantString) || {}
    ).analytics
    const type = (getSegmentInfo(segment.type) || {}).analytics
    return { variant, type }
  })
  return { segments, street }
}

const BASE_DATA_SOURCE = 'streetmix'
const DEFAULT_DATA_SOURCE = 'giz'
const CAPACITIES = {
  ...SOURCE_DATA[BASE_DATA_SOURCE].segments,
  ...SOURCE_DATA[DEFAULT_DATA_SOURCE].segments
}

export function getCapacityData (source = DEFAULT_DATA_SOURCE) {
  return SOURCE_DATA[source]
}

const sumFunc = (total, num) => {
  if (Number.isNaN(num)) return total
  return total + num
}

export const capacitySum = (a, b) => {
  return {
    ...a,
    average: a.average + b.average,
    potential: a.potential + b.potential
  }
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
 * @todo handle data source argument.
 * @param {Object} segment - the segment object to retrieve capacity for
 * @param {string} source - data source ID to use
 * @returns {Object} capacity information (or null if not defined)
 */
export function getSegmentCapacity (segment, source) {
  // Clones capacity data so that the original definition cannot be modified.
  const capacity = CAPACITIES[segment.type]

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
    // Clones capacity data so that the original definition cannot be modified.
    return {
      ...CAPACITIES[segment.type]
    }
  }

  // Returns null value if capacity is not defined
  return null
}

export const getStreetCapacity = (street) => {
  const { segments } = street
  const segmentData = segments.map(getSegmentCapacity)
  const averageTotal = segmentData
    .map((capacity) => capacity?.average || 0)
    .reduce(sumFunc, 0)
  const potentialTotal = segmentData
    .map((capacity) => capacity?.potential || 0)
    .reduce(sumFunc, 0)

  return {
    segmentData,
    averageTotal,
    potentialTotal
  }
}

export default getAnalyticsFromStreet
