import { getVariantInfo } from '../segments/variant_utils'
import { segmentsChanged } from '../segments/view'
import {
  setUpdateTime,
  saveCreatorId,
  updateEditCount
} from '../store/slices/street'
import store from '../store'
import { createNewUndoIfNecessary, unifyUndoStack } from './undo_stack'
import { updateLastStreetInfo, scheduleSavingStreetToServer } from './xhr'

let _lastStreet

export function setLastStreet () {
  _lastStreet = trimStreetData(store.getState().street)
}

// Do some work to update segment data, although they're not technically
// part of the schema (yet?) -- carried over after moving bulk of
// `updateToLatestSchemaVersion` to the server side.
export function addAltVariantObject (street) {
  street.segments = street.segments.map((segment) => {
    // Alternate method of storing variants as object key-value pairs,
    // instead of a string. We might gradually migrate toward this.
    segment.variant = getVariantInfo(segment.type, segment.variantString)

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
    boundary: street.boundary,
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
