import { DEFAULT_SEGMENTS } from '../segments/default'
import { getSegmentInfo } from '../segments/info'
import { normalizeAllSegmentWidths } from '../segments/resizing'
import { getVariantString, getVariantArray } from '../segments/variant_utils'
import { segmentsChanged } from '../segments/view'
import { getSignInData, isSignedIn } from '../users/authentication'
import { getUnits, getLeftHandTraffic } from '../users/localization'
import { generateRandSeed } from '../util/random'
import { DEFAULT_ENVIRONS } from './constants'
import {
  createNewUndoIfNecessary,
  unifyUndoStack
} from './undo_stack'
import { normalizeStreetWidth } from './width'
import { updateLastStreetInfo, scheduleSavingStreetToServer } from './xhr'
import {
  updateStreetWidth,
  updateSegments,
  setUpdateTime,
  saveCreatorId,
  updateStreetData
} from '../store/actions/street'
import { resetUndoStack } from '../store/actions/undo'
import { setUnitSettings } from '../store/actions/ui'
import store from '../store'

const DEFAULT_BUILDING_HEIGHT_LEFT = 4
const DEFAULT_BUILDING_HEIGHT_RIGHT = 3
const DEFAULT_BUILDING_VARIANT_LEFT = 'narrow'
const DEFAULT_BUILDING_VARIANT_RIGHT = 'wide'
const DEFAULT_BUILDING_HEIGHT_EMPTY = 1
const DEFAULT_BUILDING_VARIANT_EMPTY = 'grass'
const DEFAULT_STREET_WIDTH = 80

let _lastStreet

export function setLastStreet () {
  _lastStreet = trimStreetData(store.getState().street)
}

const LATEST_SCHEMA_VERSION = 19
// 1: starting point
// 2: adding leftBuildingHeight and rightBuildingHeight
// 3: adding leftBuildingVariant and rightBuildingVariant
// 4: adding transit shelter elevation
// 5: adding another lamp type (traditional)
// 6: colored streetcar lanes
// 7: colored bus and light rail lanes
// 8: colored bike lane
// 9: second car type: truck
// 10: sidewalk density
// 11: unify median and planting strip into divider
// 12: getting rid of small tree
// 13: bike rack elevation
// 14: wayfinding has three types
// 15: sidewalks have rand seed
// 16: stop saving undo stack
// 17: alternative colors for bike lanes
// 18: change lat/lng format from array to object
// 19: add environment

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
      store.dispatch(resetUndoStack())
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

export function updateToLatestSchemaVersion (street) {
  var updated = false
  while (!street.schemaVersion || (street.schemaVersion < LATEST_SCHEMA_VERSION)) {
    street = incrementSchemaVersion(street)
    updated = true
  }

  return updated
}

export function setStreetCreatorId (newId) {
  store.dispatch(saveCreatorId(newId))

  unifyUndoStack()
  updateLastStreetInfo()
}

export function setUpdateTimeToNow () {
  const updateTime = new Date().toISOString()
  store.dispatch(setUpdateTime(updateTime))
  unifyUndoStack()
}

let ignoreStreetChanges = false

export function setIgnoreStreetChanges (value) {
  ignoreStreetChanges = value
}

export function saveStreetToServerIfNecessary () {
  if (ignoreStreetChanges || store.getState().errors.abortEverything) {
    return
  }

  const street = store.getState().street
  var currentData = trimStreetData(street)

  if (JSON.stringify(currentData) !== JSON.stringify(_lastStreet)) {
    if (street.editCount !== null) {
      street.editCount++
    }
    setUpdateTimeToNow()

    // Some parts of the UI need to know this happened to respond to it
    // TODO: figure out appropriate event name
    window.dispatchEvent(new window.CustomEvent('stmx:save_street'))

    createNewUndoIfNecessary(_lastStreet, currentData)

    scheduleSavingStreetToServer()

    _lastStreet = currentData
  }
}

// Copies only the data necessary for save/undo.
export function trimStreetData (street, saveSegmentId = true) {
  var newData = {}

  newData.schemaVersion = street.schemaVersion

  newData.width = street.width
  newData.name = street.name

  newData.id = street.id
  newData.namespacedId = street.namespacedId
  newData.creatorId = street.creatorId
  newData.originalStreetId = street.originalStreetId
  newData.units = street.units

  newData.location = street.location
  newData.userUpdated = street.userUpdated

  if (street.editCount !== null) {
    // console.log('saving editCount', street.editCount)
    newData.editCount = street.editCount
  } else {
    // console.log('not saving editCount')
  }

  newData.environment = street.environment
  newData.leftBuildingHeight = street.leftBuildingHeight
  newData.rightBuildingHeight = street.rightBuildingHeight
  newData.leftBuildingVariant = street.leftBuildingVariant
  newData.rightBuildingVariant = street.rightBuildingVariant

  newData.segments = []

  for (var i in street.segments) {
    var segment = {}
    segment.type = street.segments[i].type
    segment.variantString = street.segments[i].variantString
    segment.width = street.segments[i].width
    if (street.segments[i].randSeed) {
      segment.randSeed = street.segments[i].randSeed
    }
    if (saveSegmentId) {
      segment.id = street.segments[i].id
    }
    newData.segments.push(segment)
  }

  return newData
}

function fillDefaultSegments () {
  const segments = []
  let leftHandTraffic = getLeftHandTraffic()

  for (var i in DEFAULT_SEGMENTS[leftHandTraffic]) {
    var segment = DEFAULT_SEGMENTS[leftHandTraffic][i]
    segment.warnings = []
    segment.variantString = getVariantString(segment.variant)

    if (getSegmentInfo(segment.type).needRandSeed) {
      segment.randSeed = generateRandSeed()
    }

    segments.push(segment)
  }

  store.dispatch(updateSegments(segments))
  normalizeAllSegmentWidths()
}

export function prepareDefaultStreet () {
  const defaultStreet = {
    units: getUnits(),
    location: null,
    name: null,
    userUpdated: false,
    editCount: 0,
    leftBuildingHeight: DEFAULT_BUILDING_HEIGHT_LEFT,
    leftBuildingVariant: DEFAULT_BUILDING_VARIANT_LEFT,
    rightBuildingHeight: DEFAULT_BUILDING_HEIGHT_RIGHT,
    rightBuildingVariant: DEFAULT_BUILDING_VARIANT_RIGHT,
    schemaVersion: LATEST_SCHEMA_VERSION
  }

  store.dispatch(setUnitSettings(defaultStreet.units))
  store.dispatch(updateStreetData(defaultStreet))
  store.dispatch(updateStreetWidth(normalizeStreetWidth(DEFAULT_STREET_WIDTH)))

  // console.log('editCount = 0 on default street')
  if (isSignedIn()) {
    setStreetCreatorId(getSignInData().userId)
  }
  fillDefaultSegments()
  setUpdateTimeToNow()
}

export function prepareEmptyStreet () {
  const emptyStreet = {
    units: getUnits(),
    location: null,
    name: null,
    userUpdated: false,
    editCount: 0,
    environment: DEFAULT_ENVIRONS,
    leftBuildingHeight: DEFAULT_BUILDING_HEIGHT_EMPTY,
    leftBuildingVariant: DEFAULT_BUILDING_VARIANT_EMPTY,
    rightBuildingHeight: DEFAULT_BUILDING_HEIGHT_EMPTY,
    rightBuildingVariant: DEFAULT_BUILDING_VARIANT_EMPTY,
    schemaVersion: LATEST_SCHEMA_VERSION,
    segments: []
  }

  store.dispatch(setUnitSettings(emptyStreet.units))
  store.dispatch(updateStreetData(emptyStreet))
  store.dispatch(updateStreetWidth(normalizeStreetWidth(DEFAULT_STREET_WIDTH)))

  // console.log('editCount = 0 on empty street!')
  if (isSignedIn()) {
    setStreetCreatorId(getSignInData().userId)
  }
  setUpdateTimeToNow()
}

/**
 * @todo: documentation
 *
 * @param {Boolean} dontScroll - document this
 * @param {Boolean} save - if set to `false`, calling this function will not
 *          cause a re-save of street to the server. (e.g. in the case of
 *          live update feature.) Default is `true`.
 */
export function updateEverything (dontScroll, save = true) {
  setIgnoreStreetChanges(true)
  // TODO Verify that we don't need to dispatch an update width event here
  segmentsChanged()
  setIgnoreStreetChanges(false)

  setLastStreet()

  if (save === true) {
    scheduleSavingStreetToServer()
  }
}
