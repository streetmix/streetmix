/**
 * Updates data object to newer schemas.
 *
 */
import { nanoid } from 'nanoid'
import { round } from '@streetmix/utils'

import logger from './logger.js'

const LATEST_SCHEMA_VERSION = 31

export function updateToLatestSchemaVersion (data, type) {
  // Clone original data
  let updatedData = JSON.parse(JSON.stringify(data))
  let updated = false
  let originalVersion

  while (
    updatedData.schemaVersion === undefined ||
    updatedData.schemaVersion < LATEST_SCHEMA_VERSION
  ) {
    if (originalVersion === undefined) {
      logger.info(`Updating schema for ${type} ${updatedData.id} ...`)
      originalVersion = updatedData.schemaVersion
    }
    updatedData = incrementSchemaVersion(updatedData, type)
    updated = true
  }

  if (updated) {
    logger.info(
      `Schema updated for ${type} ${updatedData.id} from ${originalVersion} → ${LATEST_SCHEMA_VERSION}`
    )
  }

  return [updated, updatedData]
}

function incrementSchemaVersion (data, type) {
  if (data.schemaVersion === undefined) {
    data.schemaVersion = 1
  }

  switch (type) {
    case 'street':
      data = incrementStreetSchemaVersion(data)
      break
    case 'user':
      data = incrementUserSchemaVersion(data)
      break
    default:
      break
  }

  data.schemaVersion++
  return data
}

function incrementStreetSchemaVersion (street) {
  switch (street.schemaVersion) {
    case 1:
      street.leftBuildingHeight = 4
      street.rightBuildingHeight = 3
      break
    case 2:
      street.leftBuildingVariant = 'narrow'
      street.rightBuildingVariant = 'wide'
      break
    case 3:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'transit-shelter') {
          segment.variantString += '|street-level'
        }
      }
      break
    case 4:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'sidewalk-lamp') {
          segment.variantString += '|modern'
        }
      }
      break
    case 5:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'streetcar') {
          segment.variantString += '|regular'
        }
      }
      break
    case 6:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'bus-lane') {
          segment.variantString += '|regular'
        } else if (segment.type === 'light-rail') {
          segment.variantString += '|regular'
        }
      }
      break
    case 7:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'bike-lane') {
          segment.variantString += '|regular'
        }
      }
      break
    case 8:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'drive-lane') {
          segment.variantString += '|car'
        }
      }
      break
    case 9:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'sidewalk') {
          segment.variantString = 'normal'
        }
      }
      break
    case 10:
      for (const i in street.segments) {
        const segment = street.segments[i]
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
      for (const i in street.segments) {
        const segment = street.segments[i]
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
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'sidewalk-bike-rack') {
          segment.variantString += '|sidewalk'
        }
      }
      break
    case 13:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'sidewalk-wayfinding') {
          segment.variantString = 'large'
        }
      }
      break
    case 14:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'sidewalk') {
          segment.randSeed = 36
        }
      }
      break
    case 15:
      break
    case 16:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'bike-lane') {
          segment.variantString = segment.variantString.replace(
            'colored',
            'green'
          )
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
        street.environment = 'day'
      }
      break
    case 19:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'bike-lane') {
          segment.variantString += '|road'
        }
      }
      break
    case 20:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'bikeshare') {
          segment.variantString += '|road'
        }
      }
      break
    case 21:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'drive-lane') {
          segment.randSeed = 37
        }
      }
      break
    case 22:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (!segment.id) {
          segment.id = nanoid()
        }
      }
      break
    case 23:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.randSeed) {
          delete segment.randSeed
        }
      }
      break
    case 24:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'bus-lane') {
          segment.variantString += '|typical'
        }
      }
      break
    case 25:
      break
    case 26:
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (typeof segment.elevation === 'undefined') {
          switch (segment.type) {
            case 'sidewalk':
            case 'sidewalk-tree':
            case 'sidewalk-bench':
            case 'sidewalk-wayfinding':
            case 'sidewalk-lamp':
            case 'utilities':
            case 'street-vendor':
            case 'flex-zone-curb':
            case 'brt-station':
              segment.elevation = 1
              break
            case 'parklet':
            case 'temporary':
            case 'scooter':
            case 'food-truck':
            case 'flex-zone':
            case 'parking-lane':
            case 'drive-lane':
            case 'turn-lane':
            case 'bus-lane':
            case 'streetcar':
            case 'light-rail':
            case 'brt-lane':
            case 'train':
            case 'magic-carpet':
              segment.elevation = 0
              break
            case 'drainage-channel':
              segment.elevation = -2
              break
            case 'sidewalk-bike-rack':
            case 'outdoor-dining':
            case 'scooter-drop-zone':
            case 'bike-lane':
            case 'bikeshare':
              if (segment.variantString.includes('road')) {
                segment.elevation = 0
              } else {
                segment.elevation = 1
              }
              break
            case 'transit-shelter':
              if (segment.variantString.includes('light-rail')) {
                segment.elevation = 2
              } else {
                segment.elevation = 1
              }
              break
            case 'divider':
              switch (segment.variantString) {
                case 'median':
                case 'planting-strip':
                case 'bush':
                case 'flowers':
                case 'big-tree':
                case 'palm-tree':
                  segment.elevation = 1
                  break
                default:
                  segment.elevation = 0
                  break
              }
              break
            default:
              segment.elevation = 0
              break
          }
        }
      }
      break
    case 27:
      if (street.editCount === undefined) {
        street.editcount = 0
      }
      break
    case 28:
      street.skybox = street.environment
      delete street.environment
      break
    case 29:
      if (street.units === 2) {
        const conversion = 0.3
        street.width = round(street.width * conversion, 3)
        for (let i = 0; i < street.segments.length; i++) {
          const segment = street.segments[i]
          segment.width = round(segment.width * conversion, 3)
        }
        street.units = 0
      } else {
        const conversion = 0.3048
        street.width = round(street.width * conversion, 3)
        for (let i = 0; i < street.segments.length; i++) {
          const segment = street.segments[i]
          segment.width = round(segment.width * conversion, 3)
        }
      }
      break
    case 30:
      if (street.units === 2) {
        street.units = 0
      }
      break
    default:
      break
  }

  return street
}

function incrementUserSchemaVersion (user) {
  switch (user.schemaVersion) {
    case 1:
      // Add any user-specific schema updates here
      break
    default:
      break
  }

  return user
}
