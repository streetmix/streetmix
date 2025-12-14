import { round } from '@streetmix/utils'
import Papa from 'papaparse'

import appURL from './url.js'

const IMPERIAL_CONVERSION_RATE = 0.3048
const IMPERIAL_PRECISION = 3

function convertMetricMeasurementToImperial(value) {
  if (value === undefined) return
  return round(value * IMPERIAL_CONVERSION_RATE, IMPERIAL_PRECISION)
}

export function streetsToCSV(json) {
  const streets = json.streets

  const maxSliceCount = streets.reduce((value, street) => {
    const length = street.data.street.segments.length
    if (length > value) return length
    else return value
  }, 1)

  const rows = streets.map((street) => {
    const slices = getSliceData(street.data.street.segments, maxSliceCount)
    return {
      id: street['id'] ?? '',
      name: street['name'] ?? '',
      creator_id: street['creatorId'] ?? '',
      width: street.data.street.width,
      widthImperial: convertMetricMeasurementToImperial(
        street.data.street.width
      ),
      left_boundary_variant: street.data.street.boundary.left.variant,
      left_boundary_floors: street.data.street.boundary.left.floors,
      ...slices,
      right_boundary_variant: street.data.street.boundary.right.variant,
      right_boundary_floors: street.data.street.boundary.left.floors,
      edit_count: street.data.street['editCount'] ?? '',
      created_at: street['createdAt'] ?? '',
      url: getStreetUrl(street),
    }
  })

  return Papa.unparse(rows)
}

function getSliceData(slices = [], maxSliceCount) {
  const object = {}

  for (let i = 0; i < maxSliceCount; i++) {
    const slice = slices[i] ?? {}
    object[`slice_${i}_type`] = slice.type ?? ''
    object[`slice_${i}_variant`] = slice.variantString ?? ''
    object[`slice_${i}_width`] = slice.width ?? ''
    object[`slice_${i}_width_imperial`] =
      convertMetricMeasurementToImperial(slice.width) ?? ''
    object[`slice_${i}_elevation`] =
      typeof slice.elevation !== 'undefined' ? slice.elevation : ''
  }

  return object
}

function getStreetUrl(street) {
  let url = appURL.href
  if (street.creatorId) {
    url += street.creatorId
  } else {
    url += '~'
  }

  url += '/'

  url += street.namespacedId

  return url
}
