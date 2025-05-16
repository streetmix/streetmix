import { round } from '@streetmix/utils'

import appURL from './url.js'

const IMPERIAL_CONVERSION_RATE = 0.3048
const IMPERIAL_PRECISION = 3

const camelToSnakeCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

function convertMetricMeasurementToImperial (value) {
  if (value === undefined) return
  return round(value * IMPERIAL_CONVERSION_RATE, IMPERIAL_PRECISION)
}

export function streetsToCSV (json) {
  const SEGMENT_REPLACE_HEADER = '<segments>'
  const streets = json.streets

  const maxSegmentCount = streets.reduce((value, street) => {
    const length = street.data.street.segments.length
    if (length > value) return length
    else return value
  }, 1)

  const headers = [
    'id',
    'name',
    'creatorId',
    'width',
    'widthImperial',
    'leftBoundaryVariant',
    'leftBoundaryFloors',
    SEGMENT_REPLACE_HEADER, // WILL BE REPLACED
    'rightBoundaryVariant',
    'rightBoundaryFloors',
    'editCount',
    'createdAt',
    'url'
  ]

  let csv = ''

  const segmentHeaders = []
  for (let i = 0; i < maxSegmentCount; i++) {
    segmentHeaders.push(`segment_${i}_type`)
    segmentHeaders.push(`segment_${i}_variant`)
    segmentHeaders.push(`segment_${i}_width`)
    segmentHeaders.push(`segment_${i}_width_imperial`)
    segmentHeaders.push(`segment_${i}_elevation`)
  }

  const segmentHeaderIndex = headers.indexOf(SEGMENT_REPLACE_HEADER)
  const segmentHeaderString = segmentHeaders.join(',')
  if (segmentHeaderIndex !== -1) {
    headers[segmentHeaderIndex] = segmentHeaderString
  }

  csv += headers.map(camelToSnakeCase).join(',') + '\n'

  const rows = streets.map((street, i) => {
    const values = headers.map((header) => {
      switch (header) {
        case 'id':
        case 'name':
        case 'creatorId':
        case 'createdAt':
          return street[header] ?? ''
        case 'leftBoundaryVariant':
          return street.data.boundary.left.variant
        case 'leftBoundaryFloors':
          return street.data.boundary.left.floors
        case 'rightBoundaryVariant':
          return street.data.boundary.right.variant
        case 'rightBoundaryFloors':
          return street.data.boundary.left.floors
        case 'editCount':
          return street.data.street[header] ?? ''
        case 'width':
          return street.data.street.width
        case 'widthImperial':
          return convertMetricMeasurementToImperial(street.data.street.width)
        case segmentHeaderString:
          return getSegmentData(street.data.street.segments, maxSegmentCount)
        case 'url':
          return getStreetUrl(street)
        default:
          return ''
      }
    })
    return values.join(',')
  })

  csv += rows.join('\n')

  return csv
}

function getSegmentData (segments = [], maxSegmentCount) {
  const values = []
  for (let i = 0; i < maxSegmentCount; i++) {
    const segment = segments[i] ?? {}
    values.push(
      [
        segment.type ?? '',
        segment.variantString ?? '',
        segment.width ?? '',
        convertMetricMeasurementToImperial(segment.width) ?? '',
        typeof segment.elevation !== 'undefined' ? segment.elevation : ''
      ].join(',')
    )
  }

  return values.join(',')
}

function getStreetUrl (street) {
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
