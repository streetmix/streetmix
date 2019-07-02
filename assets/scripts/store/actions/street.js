import { cloneDeep } from 'lodash'

import {
  REPLACE_STREET_DATA,
  ADD_SEGMENT,
  REMOVE_SEGMENT,
  MOVE_SEGMENT,
  UPDATE_SEGMENTS,
  CHANGE_SEGMENT_WIDTH,
  CHANGE_SEGMENT_VARIANT,
  CHANGE_SEGMENT_PROPERTIES,
  ADD_LOCATION,
  CLEAR_LOCATION,
  SAVE_STREET_NAME,
  SAVE_CREATOR_ID,
  SAVE_STREET_ID,
  SET_UPDATE_TIME,
  SAVE_ORIGINAL_STREET_ID,
  UPDATE_EDIT_COUNT,
  SET_UNITS,
  UPDATE_STREET_WIDTH,
  UPDATE_SCHEMA_VERSION,
  // BUILDINGS
  ADD_BUILDING_FLOOR,
  REMOVE_BUILDING_FLOOR,
  SET_BUILDING_FLOOR_VALUE,
  SET_BUILDING_VARIANT,
  SET_ENVIRONMENT
} from './'

import {
  RESIZE_TYPE_INCREMENT,
  RESIZE_TYPE_PRECISE_DRAGGING,
  resolutionForResizeType,
  normalizeSegmentWidth,
  cancelSegmentResizeTransitions
} from '../../segments/resizing'

import { ERRORS } from '../../app/errors'
import { showError } from './errors'
import { hideLoadingScreen } from '../../app/load_resources'

import { recalculateWidth } from '../../streets/width'
import { saveStreetToServer } from '../../streets/xhr'

import { setIgnoreStreetChanges, setLastStreet, saveStreetToServerIfNecessary } from '../../streets/data_model'
import { setSettings } from './settings'
import apiClient from '../../util/api'

export function updateStreetData (street) {
  return {
    type: REPLACE_STREET_DATA,
    street
  }
}

export function addSegment (index, segment) {
  return {
    type: ADD_SEGMENT,
    index,
    segment
  }
}

export function removeSegment (index, immediate = true) {
  return {
    type: REMOVE_SEGMENT,
    index,
    immediate
  }
}

export function moveSegment (index, newIndex) {
  return {
    type: MOVE_SEGMENT,
    index,
    newIndex
  }
}

export function updateSegments (segments, occupiedWidth, remainingWidth) {
  return {
    type: UPDATE_SEGMENTS,
    segments,
    occupiedWidth,
    remainingWidth
  }
}

export function clearSegments () {
  return {
    type: UPDATE_SEGMENTS,
    segments: [],
    immediate: true
  }
}

export function changeSegmentWidth (index, width) {
  return {
    type: CHANGE_SEGMENT_WIDTH,
    index,
    width
  }
}

export function changeSegmentVariant (index, set, selection) {
  return {
    type: CHANGE_SEGMENT_VARIANT,
    index,
    set,
    selection
  }
}

export function changeSegmentProperties (index, properties) {
  return {
    type: CHANGE_SEGMENT_PROPERTIES,
    index,
    properties
  }
}

export function saveStreetName (streetName, userUpdated, system = false) {
  return {
    type: SAVE_STREET_NAME,
    streetName,
    userUpdated,
    system
  }
}

export function saveCreatorId (creatorId) {
  return {
    type: SAVE_CREATOR_ID,
    creatorId
  }
}

export function saveStreetId (id, namespacedId) {
  return {
    type: SAVE_STREET_ID,
    id,
    namespacedId
  }
}

// TODO: validate time is a string matching ISO string format
export function setUpdateTime (time) {
  return {
    type: SET_UPDATE_TIME,
    time
  }
}

export function saveOriginalStreetId (id) {
  return {
    type: SAVE_ORIGINAL_STREET_ID,
    id
  }
}

export function updateEditCount (count) {
  return {
    type: UPDATE_EDIT_COUNT,
    count
  }
}

export function setUnits (units) {
  return {
    type: SET_UNITS,
    units
  }
}

export function updateStreetWidth (width) {
  return {
    type: UPDATE_STREET_WIDTH,
    width
  }
}

/**
 * updateStreetWidth as a thunk action that automatically
 * dispatches segmentChanged
 *
 * @param {Number} width
 */
export function updateStreetWidthAction (width) {
  return async (dispatch, getState) => {
    await dispatch(updateStreetWidth(width))
    await dispatch(segmentsChanged())
  }
}

export function updateSchemaVersion (version) {
  return {
    type: UPDATE_SCHEMA_VERSION,
    version
  }
}

export function addLocation (location) {
  return {
    type: ADD_LOCATION,
    location
  }
}

export function clearLocation () {
  return {
    type: CLEAR_LOCATION,
    defaultName: null
  }
}

// Buildings

/**
 * Adds one more building floor
 *
 * @param {string} position - must be 'left' or 'right
 */
export function addBuildingFloor (position) {
  return {
    type: ADD_BUILDING_FLOOR,
    position
  }
}

/**
 * Removes one building floor
 *
 * @param {string} position - must be 'left' or 'right
 */
export function removeBuildingFloor (position) {
  return {
    type: REMOVE_BUILDING_FLOOR,
    position
  }
}

/**
 * Sets building floor to specific value
 *
 * @param {string} position - must be 'left' or 'right
 * @param {Number} value - the value to set it to
 */
export function setBuildingFloorValue (position, value) {
  return {
    type: SET_BUILDING_FLOOR_VALUE,
    position,
    value
  }
}

/**
 * Sets building to a selected variant
 *
 * @param {string} position - must be 'left' or 'right
 * @param {string} variant - the variant to set it to
 */
export function setBuildingVariant (position, variant) {
  return {
    type: SET_BUILDING_VARIANT,
    position,
    variant
  }
}

// Environment

/**
 * Sets environment
 *
 * @param {string} env - name of the environment
 */

export function setEnvironment (env) {
  return {
    type: SET_ENVIRONMENT,
    env
  }
}

export const segmentsChanged = () => {
  return async (dispatch, getState) => {
    const street = getState().street
    const updatedStreet = recalculateWidth(street)
    await dispatch(updateSegments(updatedStreet.segments, updatedStreet.occupiedWidth, updatedStreet.remainingWidth))
    // ToDo: Refactor this out to be dispatched as well
    saveStreetToServerIfNecessary()
  }
}

export const removeSegmentAction = (dataNo) => {
  return async (dispatch, getState) => {
    await dispatch(removeSegment(dataNo, false))
    await dispatch(segmentsChanged())
  }
}

export const clearSegmentsAction = () => {
  return async (dispatch, getState) => {
    await dispatch(clearSegments())
    await dispatch(segmentsChanged())
  }
}

export const incrementSegmentWidth = (dataNo, add, precise, origWidth, resizeType = RESIZE_TYPE_INCREMENT) => {
  return async (dispatch, getState) => {
    const units = getState().street.units
    let resolution

    if (precise) {
      resolution = resolutionForResizeType(RESIZE_TYPE_PRECISE_DRAGGING, units)
    } else {
      resolution = resolutionForResizeType(resizeType, units)
    }

    let increment = resolution

    if (!add) {
      increment = -increment
    }

    cancelSegmentResizeTransitions()
    const width = normalizeSegmentWidth(origWidth + increment, resolution)
    await dispatch(changeSegmentWidth(dataNo, width))
    await dispatch(segmentsChanged())
  }
}

const createStreetFromResponse = (response) => {
  const street = cloneDeep(response.data.street)
  street.creatorId = (response.creator && response.creator.id) || null
  street.originalStreetId = response.originalStreetId || null
  street.updatedAt = response.updatedAt || null
  street.name = response.name || null
  street.location = response.data.street.location || null
  street.editCount = response.data.street.editCount || 0
  return street
}
export const getLastStreet = () => {
  return async (dispatch, getState) => {
    const lastStreetId = getState().settings.priorLastStreetId
    const { id, namespacedId } = getState().street
    try {
      const response = await apiClient.getStreet(lastStreetId)
      const street = createStreetFromResponse(response)
      setIgnoreStreetChanges(true)
      await dispatch(setSettings({
        lastStreetId: response.id,
        lastStreetNamespacedId: response.namespacedId,
        lastStreetCreatorId: street.creatorId
      }))
      dispatch(updateStreetData(street))
      if (id) {
        dispatch(saveStreetId(id, namespacedId))
      } else {
        dispatch(saveStreetId(response.id, response.namespacedId))
      }
      dispatch(saveOriginalStreetId(lastStreetId))
      await dispatch(segmentsChanged())
      setIgnoreStreetChanges(false)
      setLastStreet()
      saveStreetToServer(false)
    } catch (error) {
      dispatch(showError(ERRORS.NEW_STREET_SERVER_FAILURE, true))
      hideLoadingScreen()
    }
  }
}
