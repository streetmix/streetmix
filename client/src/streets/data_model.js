import { nanoid } from 'nanoid'
import clone from 'just-clone'

import {
  normalizeSegmentWidth,
  resolutionForResizeType,
  RESIZE_TYPE_INITIAL
} from '../segments/resizing'
import { getVariantString, getVariantArray } from '../segments/variant_utils'
import { segmentsChanged } from '../segments/view'
import { getSignInData, isSignedIn } from '../users/authentication'
import { SETTINGS_UNITS_IMPERIAL } from '../users/constants'
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
import { updateLastStreetInfo, scheduleSavingStreetToServer } from './xhr'
import defaultStreetTemplate from './templates/default.yaml'
import emptyStreetTemplate from './templates/empty.yaml'

// TODO: put together with other measurement conversion code?
const ROUGH_CONVERSION_RATE = (10 / 3) * 0.3048

let _lastStreet

export function setLastStreet () {
  _lastStreet = trimStreetData(store.getState().street)
}

// Server is now the source of truth of this value
const LATEST_SCHEMA_VERSION = 31

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
    skybox: street.skybox,
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

function processTemplateSlices (slices, units) {
  const processed = []
  const leftHandTraffic = getLeftHandTraffic()

  for (const i in slices) {
    const slice = clone(slices[i])

    if (leftHandTraffic) {
      // For variant keys that include "orientation"
      // exchange left for right
      // and right for left
    }
    slice.variantString = getVariantString(slice.variant)

    const variantInfo = getSegmentVariantInfo(slice.type, slice.variantString)

    slice.id = nanoid()

    // Convert slice width for imperial using rough conversion rate
    // e.g. 2.7m => 9ft, and then converted to precise metric units
    // so that it can be converted back to 9ft
    if (units === SETTINGS_UNITS_IMPERIAL) {
      const width = slice.width * ROUGH_CONVERSION_RATE
      slice.width = normalizeSegmentWidth(
        width,
        resolutionForResizeType(RESIZE_TYPE_INITIAL, units)
      )
    }

    slice.elevation = variantInfo.elevation
    slice.warnings = [false]

    processed.push(slice)
  }

  if (leftHandTraffic) {
    processed.reverse()
  }

  return processed
}

export function prepareStreet (type) {
  const units = store.getState().settings.units

  let streetTemplate
  switch (type) {
    case 'empty':
      streetTemplate = emptyStreetTemplate
      break
    case 'default':
    default:
      streetTemplate = defaultStreetTemplate
      break
  }
  const street = createStreetData(streetTemplate, units)

  store.dispatch(updateStreetData(street))

  if (isSignedIn()) {
    updateLastStreetInfo()
  }
}

function createStreetData (data, units) {
  const currentDate = new Date().toISOString()
  const slices = processTemplateSlices(data.slices, units)
  const creatorId = (isSignedIn() && getSignInData().userId) ?? null
  const street = {
    units,
    location: null,
    name: null,
    showAnalytics: true,
    userUpdated: false,
    editCount: 0,
    skybox: DEFAULT_SKYBOX,
    schemaVersion: LATEST_SCHEMA_VERSION,
    segments: slices,
    updatedAt: currentDate,
    clientUpdatedAt: currentDate,
    creatorId,
    leftBuildingHeight: data.edges.left.height,
    leftBuildingVariant: data.edges.left.variant,
    rightBuildingHeight: data.edges.right.height,
    rightBuildingVariant: data.edges.right.variant,
    ...data
  }

  // Cleanup
  delete street.edges
  delete street.slices

  if (units === SETTINGS_UNITS_IMPERIAL) {
    street.width *= ROUGH_CONVERSION_RATE
  }

  return street
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
