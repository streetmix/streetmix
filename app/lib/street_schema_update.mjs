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

const LATEST_SCHEMA_VERSION = 27
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

export function updateToLatestSchemaVersion (street) {
  // Clone original street
  let updatedStreet = JSON.parse(JSON.stringify(street))
  let updated = false

  while (
    updatedStreet.schemaVersion === undefined ||
    updatedStreet.schemaVersion < LATEST_SCHEMA_VERSION
  ) {
    updatedStreet = incrementSchemaVersion(updatedStreet)
    updated = true
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

    // TODO: Remainder of updates
  }

  street.schemaVersion++
  return street
}
