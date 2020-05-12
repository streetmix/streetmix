import { v4 as uuidv4 } from 'uuid'
import cloneDeep from 'lodash/cloneDeep'
import { DEFAULT_SEGMENTS } from '../segments/default'
import { getSegmentInfo } from '../segments/info'
import {
  normalizeSegmentWidth,
  resolutionForResizeType,
  RESIZE_TYPE_INITIAL
} from '../segments/resizing'
import { getVariantString, getVariantArray } from '../segments/variant_utils'
import { segmentsChanged } from '../segments/view'
import { getSignInData, isSignedIn } from '../users/authentication'
import { getLeftHandTraffic } from '../users/localization'
import { generateRandSeed } from '../util/random'
import { DEFAULT_ENVIRONS } from './constants'
import { createNewUndoIfNecessary, unifyUndoStack } from './undo_stack'
import { normalizeStreetWidth } from './width'
import { updateLastStreetInfo, scheduleSavingStreetToServer } from './xhr'
import {
  setUpdateTime,
  saveCreatorId,
  updateStreetData,
  updateEditCount
} from '../store/slices/street'
import { resetUndoStack } from '../store/slices/undo'
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

const LATEST_SCHEMA_VERSION = 22
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
// 20: add sidewalk-level bike lanes
// 21: add sidewalk-level bikeshare docks
// 22: add random seed to drive lanes for pedestrians

function incrementSchemaVersion (street) {
  let segment, variant

  if (!street.schemaVersion) {
    // Fix a bug in 2018 where a street does not have a schema version when it should.
    if (
      (street.createdAt && street.createdAt.indexOf('2018') === 0) ||
      (street.updatedAt && street.updatedAt.indexOf('2018') === 0)
    ) {
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
      for (const i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'sidewalk-lamp') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['lamp-type'] = 'modern'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 5:
      for (const i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'streetcar') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['public-transit-asphalt'] = 'regular'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 6:
      for (const i in street.segments) {
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
      for (const i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'bike-lane') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['bike-asphalt'] = 'regular'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 8:
      for (const i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'drive-lane') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['car-type'] = 'car'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 9:
      for (const i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'sidewalk') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['sidewalk-density'] = 'normal'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 10:
      for (const i in street.segments) {
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
      for (const i in street.segments) {
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
      for (const i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'sidewalk-bike-rack') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['bike-rack-elevation'] = 'sidewalk'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 13:
      for (const i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'sidewalk-wayfinding') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant['wayfinding-type'] = 'large'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 14:
      for (const i in street.segments) {
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
      for (const i in street.segments) {
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
      break
    case 19:
      for (const i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'bike-lane') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant.elevation = 'road'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 20:
      for (const i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'bikeshare') {
          variant = getVariantArray(segment.type, segment.variantString)
          variant.elevation = 'road'
          segment.variantString = getVariantString(variant)
        }
      }
      break
    case 21:
      for (const i in street.segments) {
        segment = street.segments[i]
        if (segment.type === 'drive-lane') {
          segment.randSeed = generateRandSeed()
        }
      }
      break
  }

  street.schemaVersion++
  return street
}

/**
 * This function mutates the original street object in place and then returns
 * a boolean for whether it has been updated to the lastest schema version.
 *
 * @todo We should change this behavior (it's weird)
 *
 * @param {Object} street
 */
export function updateToLatestSchemaVersion (street) {
  var updated = false
  while (
    !street.schemaVersion ||
    street.schemaVersion < LATEST_SCHEMA_VERSION
  ) {
    street = incrementSchemaVersion(street)
    updated = true
  }

  // Do some work to update segment data, although they're not technically
  // part of the schema (yet?)
  street.segments = street.segments.map((segment) => {
    // Alternate method of storing variants as object key-value pairs,
    // instead of a string. We might gradually migrate toward this.
    segment.variant = getVariantArray(segment.type, segment.variantString)

    // Add uuids to segments
    if (!segment.id) {
      segment.id = uuidv4()
    }

    return segment
  })

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
      store.dispatch(updateEditCount(street.editCount + 1))
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
  const newData = {
    schemaVersion: street.schemaVersion,
    width: street.width,
    name: street.name,
    id: street.id,
    namespacedId: street.namespacedId,
    creatorId: street.creatorId,
    originalStreetId: street.originalStreetId,
    units: street.units,
    location: street.location,
    userUpdated: street.userUpdated,
    environment: street.environment,
    showAnalytics: street.showAnalytics,
    leftBuildingHeight: street.leftBuildingHeight,
    rightBuildingHeight: street.rightBuildingHeight,
    leftBuildingVariant: street.leftBuildingVariant,
    rightBuildingVariant: street.rightBuildingVariant,
    segments: street.segments.map((origSegment) => {
      const segment = {
        type: origSegment.type,
        variantString: origSegment.variantString,
        width: origSegment.width,
        label: origSegment.label
      }

      if (origSegment.randSeed) {
        segment.randSeed = origSegment.randSeed
      }

      // Segment id is used as a key in rendering so we know
      // if a segment has the same identity as before. It is only
      // saved for the view, it does not need to be saved on the server
      if (saveSegmentId) {
        segment.id = origSegment.id
      }

      return segment
    })
  }

  if (street.editCount !== null) {
    newData.editCount = street.editCount
  }

  return newData
}

function fillDefaultSegments (units) {
  const segments = []
  const leftHandTraffic = getLeftHandTraffic()

  for (const i in DEFAULT_SEGMENTS[leftHandTraffic]) {
    const segment = cloneDeep(DEFAULT_SEGMENTS[leftHandTraffic][i])
    segment.id = uuidv4()
    segment.warnings = []
    segment.variantString = getVariantString(segment.variant)
    segment.width = normalizeSegmentWidth(
      segment.width,
      resolutionForResizeType(RESIZE_TYPE_INITIAL, units)
    )

    if (getSegmentInfo(segment.type).needRandSeed) {
      segment.randSeed = generateRandSeed()
    }

    segments.push(segment)
  }

  return segments
}

export function prepareDefaultStreet () {
  const units = store.getState().settings.units
  const currentDate = new Date().toISOString()
  const defaultStreet = {
    units: units,
    location: null,
    name: null,
    userUpdated: false,
    editCount: 0,
    width: normalizeStreetWidth(DEFAULT_STREET_WIDTH, units),
    environment: DEFAULT_ENVIRONS,
    leftBuildingHeight: DEFAULT_BUILDING_HEIGHT_LEFT,
    leftBuildingVariant: DEFAULT_BUILDING_VARIANT_LEFT,
    rightBuildingHeight: DEFAULT_BUILDING_HEIGHT_RIGHT,
    rightBuildingVariant: DEFAULT_BUILDING_VARIANT_RIGHT,
    schemaVersion: LATEST_SCHEMA_VERSION,
    segments: fillDefaultSegments(units),
    updatedAt: currentDate,
    clientUpdatedAt: currentDate,
    creatorId: (isSignedIn() && getSignInData().userId) || null
  }

  store.dispatch(updateStreetData(defaultStreet))

  if (isSignedIn()) {
    updateLastStreetInfo()
  }
}

export function prepareEmptyStreet () {
  const units = store.getState().settings.units
  const currentDate = new Date().toISOString()
  const emptyStreet = {
    units: units,
    location: null,
    name: null,
    userUpdated: false,
    editCount: 0,
    width: normalizeStreetWidth(DEFAULT_STREET_WIDTH, units),
    environment: DEFAULT_ENVIRONS,
    leftBuildingHeight: DEFAULT_BUILDING_HEIGHT_EMPTY,
    leftBuildingVariant: DEFAULT_BUILDING_VARIANT_EMPTY,
    rightBuildingHeight: DEFAULT_BUILDING_HEIGHT_EMPTY,
    rightBuildingVariant: DEFAULT_BUILDING_VARIANT_EMPTY,
    schemaVersion: LATEST_SCHEMA_VERSION,
    segments: [],
    updatedAt: currentDate,
    clientUpdatedAt: currentDate,
    creatorId: (isSignedIn() && getSignInData().userId) || null
  }

  store.dispatch(updateStreetData(emptyStreet))

  if (isSignedIn()) {
    updateLastStreetInfo()
  }
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
