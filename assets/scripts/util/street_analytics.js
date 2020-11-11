import { getSegmentVariantInfo, getSegmentInfo } from '../segments/info'
// import store from '../store'
import memoizeFormatConstructor from './memoized_formatting'
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

const NO_CAPACITY = { average: 0, potential: 0 }
const UNDEFINED_CAPACITY = { average: 0, potential: 0, display: false }

const BASE_DATA_SOURCE = 'streetmix'
const DEFAULT_DATA_SOURCE = 'giz'
const CAPACITIES = {
  ...SOURCE_DATA[BASE_DATA_SOURCE].segments,
  ...SOURCE_DATA[DEFAULT_DATA_SOURCE].segments
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
