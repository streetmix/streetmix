/**
 * Updates street data object to newer schemas.
 *
 * This used to reside on the client, but it's better on the server.
 * The most important reason is that any external API read should
 * produce the most recent street data.
 *
 * This will likely be a staged refactor: the server takes the schema
 * update only so far, and the client takes it the rest of the way.
 * Eventually the server should do the entire update.
 *
 * The primary goal is to ensure that the street JSON has the correct
 * shape and value types. In order to make the refactor easier, we
 * are hardcoding most values rather than use constants or perform
 * lookups.
 */
import { nanoid } from 'nanoid'
import logger from './logger.mjs'

const LATEST_SCHEMA_VERSION = 28
// 1: starting point
// 2: add leftBuildingHeight and rightBuildingHeight
// 3: add leftBuildingVariant and rightBuildingVariant
// 4: add transit shelter elevation
// 5: add another lamp type (traditional)
// 6: colored streetcar lanes
// 7: colored bus and light rail lanes
// 8: colored bike lane
// 9: second car type: truck
// 10: sidewalk density
// 11: unify median and planting strip into divider
// 12: get rid of small tree
// 13: bike rack elevation
// 14: wayfinding has three types
// 15: sidewalks have rand seed
// 16: stop saving undo stack
// 17: alternative colors for bike lanes
// 18: change lat/lng format from array to object
// 19: add environment
// 20: add sidewalk-level bike lanes
// 21: add sidewalk-level bikeshare docks
// 22: add random seed to drive lanes for pedestrians
// 23: add unique id to each segment
// 24: remove random seed from any segment
// 25: add bus type
// 26: add elevation properties to segments
// 27: bugfix missing elevation properties from previous schema
// 28: add editCount property if it doesn't exist

export function updateToLatestSchemaVersion (street) {
  // Clone original street
  let updatedStreet = JSON.parse(JSON.stringify(street))
  let updated = false
  let originalVersion

  while (
    updatedStreet.schemaVersion === undefined ||
    updatedStreet.schemaVersion < LATEST_SCHEMA_VERSION
  ) {
    if (originalVersion === undefined) {
      logger.info(`Updating schema for street ${updatedStreet.id} ...`)
      originalVersion = updatedStreet.schemaVersion
    }
    updatedStreet = incrementSchemaVersion(updatedStreet)
    updated = true
  }

  if (updated) {
    logger.info(
      `Schema updated for street ${updatedStreet.id} from ${originalVersion} → ${LATEST_SCHEMA_VERSION}`
    )
  }

  return [updated, updatedStreet]
}

function incrementSchemaVersion (street) {
  if (street.schemaVersion === undefined) {
    // Fix a bug in 2018 where a street did not have a schema version
    // when it should've.
    if (
      (street.createdAt && street.createdAt.indexOf('2018') === 0) ||
      (street.updatedAt && street.updatedAt.indexOf('2018') === 0)
    ) {
      street.schemaVersion = 17
      // Otherwise, it's OG data; create the property and set it to 1
    } else {
      street.schemaVersion = 1
    }
  }

  // When schemaVersion matches a value, we needs to apply the updates for
  // the _next_ schemaVersion. e.g. if schemaVersion === 1, apply updates
  // to make it match schemaVersion === 2. See above comments for a list of
  // all changes.
  switch (street.schemaVersion) {
    case 1:
      // 2: add leftBuildingHeight and rightBuildingHeight
      street.leftBuildingHeight = 4
      street.rightBuildingHeight = 3
      break
    case 2:
      // 3: add leftBuildingVariant and rightBuildingVariant
      street.leftBuildingVariant = 'narrow'
      street.rightBuildingVariant = 'wide'
      break
    case 3:
      // 4: add transit shelter elevation
      // Existing shelters are "street-level" elevation
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'transit-shelter') {
          segment.variantString += '|street-level'
        }
      }
      break
    case 4:
      // 5: add another lamp type (traditional)
      // Existing lamps are "modern" type
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'sidewalk-lamp') {
          segment.variantString += '|modern'
        }
      }
      break
    case 5:
      // 6: colored streetcar lanes
      // Existing streetcar lanes are "regular" asphalt
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'streetcar') {
          segment.variantString += '|regular'
        }
      }
      break
    case 6:
      // 7: colored bus and light rail lanes
      // Existing lanes are "regular" asphalt variant
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
      // 8: colored bike lane
      // Existing bike lanes are "regular" asphalt
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'bike-lane') {
          segment.variantString += '|regular'
        }
      }
      break
    case 8:
      // 9: second car type: truck
      // Existing drive lanes are "car" variant
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'drive-lane') {
          segment.variantString += '|car'
        }
      }
      break
    case 9:
      // 10: sidewalk density
      // Existing sidewlks have "normal" density
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'sidewalk') {
          // No existing variant string, so assign instead of append
          segment.variantString = 'normal'
        }
      }
      break
    case 10:
      // 11: unify median and planting strip into divider
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
      // 12: get rid of small tree
      // Reassign all small trees to the big tree
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
      // 13: bike rack elevation
      // Existing bike racks are "sidewalk" variant
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'sidewalk-bike-rack') {
          segment.variantString += '|sidewalk'
        }
      }
      break
    case 13:
      // 14: wayfinding has three types
      // Existing signs are the "large" variant
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'sidewalk-wayfinding') {
          // No existing variant, so assign instead of append
          segment.variantString = 'large'
        }
      }
      break
    case 14:
      // 15: sidewalks have rand seed
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'sidewalk') {
          // With schema version 24, we no longer need randseeds
          // for segments, so don't bother generating a new one here,
          // just fill this in for placeholder effect
          segment.randSeed = 36
        }
      }
      break
    case 15:
      // 16: stop saving undo stack
      // Note: this is a noop because the undo stack values are not properties
      // of the street object. The properties are `undoStack` and `undoPosition`,
      // siblings to `street` on the parent object. Previous versions of this
      // update script used an incorrect implementation
      break
    case 16:
      // 17: alternative colors for bike lanes
      // Existing "colored" variant is now "green"
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
      // 18: change lat/lng format from array to object
      if (street.location && Array.isArray(street.location.latlng)) {
        street.location.latlng = {
          lat: street.location.latlng[0],
          lng: street.location.latlng[1]
        }
      }
      break
    case 18:
      // 19: add environment
      if (!street.environment) {
        street.environment = 'day'
      }
      break
    case 19:
      // 20: add sidewalk-level bike lanes
      // Existing bike lanes are "road" level variants
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'bike-lane') {
          segment.variantString += '|road'
        }
      }
      break
    case 20:
      // 21: add sidewalk-level bikeshare docks
      // Existing bikeshare docks are "road" level variants
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'bikeshare') {
          segment.variantString += '|road'
        }
      }
      break
    case 21:
      // 22: add random seed to drive lanes for pedestrians
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'drive-lane') {
          // With schema version 24, we no longer need randseeds
          // for segments, so don't bother generating a new one here,
          // just fill this in for placeholder effect
          segment.randSeed = 37
        }
      }
      break
    case 22:
      // 23: add unique id to each segment
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (!segment.id) {
          segment.id = nanoid()
        }
      }
      break
    case 23:
      // 24: remove random seed from any segment
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.randSeed) {
          delete segment.randSeed
        }
      }
      break
    case 24:
      // 25: add bus type
      // Existing bus lanes are "typical" variant
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (segment.type === 'bus-lane') {
          segment.variantString += '|typical'
        }
      }
      break
    case 25:
      // 26: add elevation properties to segments
      // No-op, superceded by schema version 27
      break
    case 26:
      // 27: bugfix missing elevation properties from previous schema
      // When the previous schema version was added, there was a bug where new
      // streets could be created without elevation properties. Bumping the
      // schema version + running the update again forces streets created
      // under schema version 26 to properly backfill elevation data.
      // This makes schema version 26 a no-op
      // This is manually hard-coded to avoid doing segment info lookups!
      for (const i in street.segments) {
        const segment = street.segments[i]
        if (typeof segment.elevation === 'undefined') {
          // TODO manually hard code lookup
          // const variantInfo = getSegmentVariantInfo(
          //   segment.type,
          //   segment.variantString
          // )
          switch (segment.type) {
            // Segments that are always elevation 1
            case 'sidewalk': // default elevation, if nonexistent, is 1
            case 'sidewalk-tree':
            case 'sidewalk-bench':
            case 'sidewalk-wayfinding':
            case 'sidewalk-lamp':
            case 'utilities':
            case 'street-vendor': // default elevation is 1
            case 'flex-zone-curb':
            case 'brt-station':
              segment.elevation = 1
              break
            // Segments that are always elevation 0
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
            // Segment that is always elevation -2
            case 'drainage-channel':
              segment.elevation = -2
              break
            // Conditional elevations
            // For these segment types, if the variant string includes "road",
            // assume they are road elevation (0), otherwise sidewalk elevation
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
            // The one conditional segment that can be elevation 2
            case 'transit-shelter':
              if (segment.variantString.includes('light-rail')) {
                segment.elevation = 2
              } else {
                segment.elevation = 1
              }
              break
            // Condition based on type
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
      // 28: add editCount property if it doesn't exist
      // This should have always existed, adding it now removes a client-side
      // monkey-patch that forces it to be there.
      // If unknown, value is 0
      if (street.editCount === undefined) {
        street.editcount = 0
      }
      break
    default:
      // no-op
      break
  }

  street.schemaVersion++
  return street
}
