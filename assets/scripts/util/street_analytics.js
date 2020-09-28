import { getSegmentVariantInfo, getSegmentInfo } from '../segments/info'
// import store from '../store'
import memoizeFormatConstructor from './memoized_formatting'
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

const NO_CAPACITY = { average: 0, potential: 0 }
const UNDEFINED_CAPACITY = { average: 0, potential: 0, display: false }

const CAPACITIES = {
  sidewalk: { average: 19000, potential: 19000 },
  'drive-lane': { average: 1500, potential: 2000 },
  'bike-lane': { average: 14000, potential: 14000 },
  scooter: { average: 14000, potential: 14000 },
  'light-rail': { average: 18000, potential: 20000 },
  streetcar: { average: 18000, potential: 20000 },
  'bus-lane': { average: 5000, potential: 8000 },
  'brt-lane': { average: 14000, potential: 24000 },
  'magic-carpet': { average: 2, potential: 3 }
}

const hasCapacityType = (type) => {
  return type in CAPACITIES
}

export const getCapacity = (type) => {
  return hasCapacityType(type) ? { ...CAPACITIES[type] } : UNDEFINED_CAPACITY
}

const sumFunc = (total, num) => {
  if (Number.isNaN(num)) return total
  return total + num
}

const addSegmentData = (item) => {
  const hasZeroCapacityError =
    item &&
    hasCapacityType(item.type) &&
    item.warnings &&
    (item.warnings[SEGMENT_WARNING_OUTSIDE] ||
      item.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL])

  return {
    label: `${item.variantString} ${item.type}`,
    capacity: hasZeroCapacityError ? NO_CAPACITY : getCapacity(item.type),
    segment: item
  }
}

export const capacitySum = (a, b) => {
  return {
    ...a,
    average: a.average + b.average,
    potential: a.potential + b.potential
  }
}

const NumberFormat = memoizeFormatConstructor(Intl.NumberFormat)

export const formatCapacity = (amount, locale) => {
  return NumberFormat(locale).format(amount)
}

export const getSegmentCapacity = (segment) => {
  return addSegmentData(segment)
}

export const getStreetCapacity = (street) => {
  const { segments } = street
  const segmentData = segments.map(addSegmentData)
  const averageTotal = segmentData
    .map((item) => item.capacity.average || 0)
    .reduce(sumFunc, 0)
  const potentialTotal = segmentData
    .map((item) => item.capacity.potential || 0)
    .reduce(sumFunc, 0)

  return {
    segmentData,
    averageTotal,
    potentialTotal
  }
}

export default getAnalyticsFromStreet
