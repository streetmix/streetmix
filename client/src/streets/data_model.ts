import { getVariantInfo } from '../segments/variant_utils.js'
import { segmentsChanged } from '../segments/view.js'
import store from '../store'
import {
  saveCreatorId,
  setUpdateTime,
  updateEditCount,
} from '../store/slices/street.js'
import { createNewUndoIfNecessary, unifyUndoStack } from './undo_stack.js'
import { scheduleSavingStreetToServer, updateLastStreetInfo } from './xhr.js'

import type {
  SliceItemForServerTransmission,
  StreetState,
} from '@streetmix/types'

let _lastStreet: Partial<StreetState>

export function setLastStreet() {
  _lastStreet = trimStreetData(store.getState().street)
}

// Do some work to update segment data, although they're not technically
// part of the schema (yet?) -- carried over after moving bulk of
// `updateToLatestSchemaVersion` to the server side.
export function addAltVariantObject(street: StreetState) {
  street.segments = street.segments.map((segment) => {
    // Alternate method of storing variants as object key-value pairs,
    // instead of a string. We might gradually migrate toward this.
    segment.variant = getVariantInfo(segment.type, segment.variantString)

    // Also use this loop to add empty warnings array
    // Prevents bugs where things expect the array to be there
    segment.warnings = [false]

    return segment
  })
}

export function setStreetCreatorId(newId: string | null) {
  store.dispatch(saveCreatorId(newId))

  unifyUndoStack()
  updateLastStreetInfo()
}

export function setUpdateTimeToNow() {
  const updateTime = new Date().toISOString()
  store.dispatch(setUpdateTime(updateTime))
  unifyUndoStack()
}

let ignoreStreetChanges = false

export function setIgnoreStreetChanges(value: boolean) {
  ignoreStreetChanges = value
}

export function saveStreetToServerIfNecessary(force = false) {
  if (ignoreStreetChanges || store.getState().errors.abortEverything) {
    return
  }

  const street = store.getState().street
  const currentData = trimStreetData(street)

  if (
    JSON.stringify(currentData) !== JSON.stringify(_lastStreet) ||
    force === true
  ) {
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
export function trimStreetData(street: StreetState): Partial<StreetState> {
  const newData: Partial<StreetState> = {
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
    weather: street.weather,
    boundary: street.boundary,
    segments: street.segments.map((s) => {
      // TODO: don't manually copy, just delete the properties that don't exist?
      const slice: SliceItemForServerTransmission = {
        id: s.id,
        type: s.type,
        variantString: s.variantString,
        width: s.width,
        elevation: s.elevation,
        slope: s.slope,
        label: s.label,
      }

      if (s.elevationChanged === true) {
        slice.elevationChanged = true
      }

      return slice
    }),
  }

  if (street.editCount !== null) {
    newData.editCount = street.editCount
  }

  return newData
}

export function updateEverything(save = true) {
  setIgnoreStreetChanges(true)
  segmentsChanged()
  setIgnoreStreetChanges(false)

  setLastStreet()

  // If `save` is `false`, this will not re-save the street to the server
  // (e.g. in the case of live update feature)
  if (save === true) {
    scheduleSavingStreetToServer()
  }
}
