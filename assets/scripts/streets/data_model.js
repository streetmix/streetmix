import { nanoid } from 'nanoid'
import clone from 'just-clone'
import { DEFAULT_SEGMENTS } from '../segments/default'
import {
  normalizeSegmentWidth,
  resolutionForResizeType,
  RESIZE_TYPE_INITIAL
} from '../segments/resizing'
import { getVariantString, getVariantArray } from '../segments/variant_utils'
import { segmentsChanged } from '../segments/view'
import { getSignInData, isSignedIn } from '../users/authentication'
import { getLeftHandTraffic } from '../users/localization'
import {
  setUpdateTime,
  saveCreatorId,
  updateStreetData,
  updateEditCount
} from '../store/slices/street'
import store from '../store'
import { getSegmentVariantInfo } from '../segments/info'
import { DEFAULT_SKYBOX } from '../sky/constants'
import { createNewUndoIfNecessary, unifyUndoStack } from './undo_stack'
import { normalizeStreetWidth } from './width'
import { updateLastStreetInfo, scheduleSavingStreetToServer } from './xhr'

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

// Server is now the source of truth of this value
const LATEST_SCHEMA_VERSION = 27

// Do some work to update segment data, although they're not technically
// part of the schema (yet?) -- carried over after moving bulk of
// `updateToLatestSchemaVersion` to the server side.
export function addAltVariantObject (street) {
  street.segments = street.segments.map((segment) => {
    // Alternate method of storing variants as object key-value pairs,
    // instead of a string. We might gradually migrate toward this.
    segment.variant = getVariantArray(segment.type, segment.variantString)

    return segment
  })
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
  const currentData = trimStreetData(street)

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
export function trimStreetData (street) {
  const newData = {
    schemaVersion: street.schemaVersion,
    showAnalytics: street.showAnalytics,
    capacitySource: street.capacitySource,
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
    leftBuildingHeight: street.leftBuildingHeight,
    rightBuildingHeight: street.rightBuildingHeight,
    leftBuildingVariant: street.leftBuildingVariant,
    rightBuildingVariant: street.rightBuildingVariant,
    segments: street.segments.map((origSegment) => {
      const segment = {
        id: origSegment.id,
        type: origSegment.type,
        variantString: origSegment.variantString,
        width: origSegment.width,
        elevation: origSegment.elevation,
        label: origSegment.label
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
    const segment = clone(DEFAULT_SEGMENTS[leftHandTraffic][i])

    segment.variantString = getVariantString(segment.variant)

    const variantInfo = getSegmentVariantInfo(
      segment.type,
      segment.variantString
    )

    segment.id = nanoid()
    segment.width = normalizeSegmentWidth(
      segment.width,
      resolutionForResizeType(RESIZE_TYPE_INITIAL, units)
    )
    segment.elevation = variantInfo.elevation
    segment.warnings = []

    segments.push(segment)
  }

  return segments
}

export function prepareDefaultStreet () {
  const units = store.getState().settings.units
  const currentDate = new Date().toISOString()
  const defaultStreet = {
    units,
    location: null,
    name: null,
    showAnalytics: true,
    userUpdated: false,
    editCount: 0,
    width: normalizeStreetWidth(DEFAULT_STREET_WIDTH, units),
    environment: DEFAULT_SKYBOX,
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
    units,
    location: null,
    name: null,
    showAnalytics: true,
    userUpdated: false,
    editCount: 0,
    width: normalizeStreetWidth(DEFAULT_STREET_WIDTH, units),
    environment: DEFAULT_SKYBOX,
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
