const { getVariantString, getVariantArray } = require('../../lib/variant')

const LATEST_SCHEMA_VERSION = 19

const DEFAULT_ENVIRONS = 'day'
const DEFAULT_BUILDING_HEIGHT_LEFT = 4
const DEFAULT_BUILDING_HEIGHT_RIGHT = 3
const DEFAULT_BUILDING_VARIANT_LEFT = 'narrow'
const DEFAULT_BUILDING_VARIANT_RIGHT = 'wide'

function incrementSchemaVersion (street) {
  let segment, variant

  if (!street.schemaVersion) {
    // Fix a bug in 2018 where a street does not have a schema version when it should.
    if ((street.createdAt && street.createdAt.indexOf('2018') === 0) || (street.updatedAt && street.updatedAt.indexOf('2018') === 0)) {
      street.schemaVersion = 17
    } else {
      street.schemaVersion = 1
    }
  }

  switch (street.schemaVersion) {
    case 1:
      street.leftBuildingHeight = DEFAULT_BUILDING_HEIGHT_LEFT
      street.rightBuildingHeight = DEFAULT_BUILDING_HEIGHT_RIGHT
      break
    case 2:
      street.leftBuildingVariant = DEFAULT_BUILDING_VARIANT_LEFT
      street.rightBuildingVariant = DEFAULT_BUILDING_VARIANT_RIGHT
      break
    case 3:
      for (var i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'transit-shelter') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['transit-shelter-elevation'] = 'street-level'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 4:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'sidewalk-lamp') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['lamp-type'] = 'modern'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 5:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'streetcar') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['public-transit-asphalt'] = 'regular'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 6:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'bus-lane') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['bus-asphalt'] = 'regular'
          segment.variantString = getVariantString(variant)
        } else if (segment.type === 'light-rail') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['public-transit-asphalt'] = 'regular'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 7:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'bike-lane') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['bike-asphalt'] = 'regular'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 8:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'drive-lane') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['car-type'] = 'car'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 9:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'sidewalk') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['sidewalk-density'] = 'normal'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 10:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'planting-strip') {
          segment.type = 'divider'

          if (segment.variantString === '') {
            segment.variantString = 'planting-strip'
          }
        } else if (segment.type === 'small-median') {
          segment.type = 'divider'
          segment.variantString = 'median'
        }
      }
      break
    case 11:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'divider') {
          if (segment.variantString === 'small-tree') {
            segment.variantString = 'big-tree'
          }
        } else if (segment.type === 'sidewalk-tree') {
          if (segment.variantString === 'small') {
            segment.variantString = 'big'
          }
        }
      }
      break
    case 12:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'sidewalk-bike-rack') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['bike-rack-elevation'] = 'sidewalk'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 13:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'sidewalk-wayfinding') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['wayfinding-type'] = 'large'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 14:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'sidewalk') {
          segment.randSeed = 35
        }
      }
      break
    case 15:
      break
    case 16:
      for (let i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'bike-lane') {
          variant = getVariantArray(segment.type, segment.variantString)
          if (variant['bike-asphalt'] === 'colored') {
            variant['bike-asphalt'] = 'green'
          }
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 17:
      if (street.location && Array.isArray(street.location.latlng)) {
        street.location.latlng = {
          lat: street.location.latlng[0],
          lng: street.location.latlng[1]
        }
      }
      break
    case 18:
      if (!street.environment) {
        street.environment = DEFAULT_ENVIRONS
      }
  }

  street.schemaVersion++
  return street
}

exports.updateToLatestSchemaVersion = function (street) {
  while (!street.schemaVersion || (street.schemaVersion < LATEST_SCHEMA_VERSION)) {
    street = incrementSchemaVersion(street)
  }
  return street
}
