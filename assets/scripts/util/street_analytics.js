import { getSegmentVariantInfo, getSegmentInfo } from '../segments/info'
import memoizeFormatConstructor from './memoized_formatting'
import {
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL
} from '../segments/constants'
import { SOURCE_LIST, DEFAULT_ANALYTICS_SOURCE } from '../app/constants'

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

export const hasCapacityType = (type, source = DEFAULT_ANALYTICS_SOURCE) => {
  const capacityList = SOURCE_LIST.find((item) => item.value === source)
  if (!capacityList || !capacityList.capacities) return false
  if (type in capacityList.capacities) {
    return true
  } else {
    return false
  }
}

export const getCapacityBySource = (
  type,
  source = DEFAULT_ANALYTICS_SOURCE
) => {
  const capacityList = SOURCE_LIST.find((item) => item.value === source)
  if (!capacityList || !capacityList.capacities) return UNDEFINED_CAPACITY
  if (type in capacityList.capacities) {
    return { ...capacityList.capacities[type] }
  } else {
    return UNDEFINED_CAPACITY
  }
}

const sumFunc = (total, num) => {
  if (Number.isNaN(num)) return total
  return total + num
}

const addSegmentData = (item, source = DEFAULT_ANALYTICS_SOURCE) => {
  const hasZeroCapacityError =
    item &&
    hasCapacityType(item.type, source) &&
    item.warnings &&
    (item.warnings[SEGMENT_WARNING_OUTSIDE] ||
      item.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL])

  return {
    label: `${item.variantString} ${item.type}`,
    capacity: hasZeroCapacityError
      ? NO_CAPACITY
      : getCapacityBySource(item.type, source),
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

export const getSegmentCapacity = (
  segment,
  source = DEFAULT_ANALYTICS_SOURCE
) => {
  return addSegmentData(segment, source)
}

export const getStreetCapacity = (
  street,
  source = DEFAULT_ANALYTICS_SOURCE
) => {
  const { segments } = street
  const segmentData = segments.map((item) => addSegmentData(item, source))
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
