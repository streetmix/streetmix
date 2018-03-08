import {
  ADD_SEGMENT,
  REMOVE_SEGMENT,
  MOVE_SEGMENT,
  REPLACE_STREET_DATA,
  CHANGE_SEGMENT_WIDTH,
  CHANGE_SEGMENT_VARIANT,
  ADD_LOCATION,
  CLEAR_LOCATION,
  SAVE_STREET_NAME,
  SAVE_CREATOR_ID,
  SAVE_STREET_ID,
  SET_UPDATE_TIME,
  SAVE_ORIGINAL_STREET_ID,
  UPDATE_EDIT_COUNT,
  UPDATE_SEGMENTS,
  UPDATE_STREET,
  // BUILDINGS
  ADD_BUILDING_FLOOR,
  REMOVE_BUILDING_FLOOR,
  SET_BUILDING_FLOOR_VALUE,
  SET_BUILDING_VARIANT
} from './'
import { t } from '../../app/locale'

export function addSegment (index, segment) {
  return {
    type: ADD_SEGMENT,
    index,
    segment
  }
}

export function removeSegment (index) {
  return {
    type: REMOVE_SEGMENT,
    index
  }
}

export function moveSegment (index, newIndex) {
  return {
    type: MOVE_SEGMENT,
    index,
    newIndex
  }
}

// temporary while we migrate data stores
export function updateStreetData (street) {
  return {
    type: REPLACE_STREET_DATA,
    street
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

export function updateStreet (key, value) {
  return {
    type: UPDATE_STREET,
    key,
    value
  }
}

export function updateSegments (segments) {
  return {
    type: UPDATE_SEGMENTS,
    segments
  }
}

export function clearSegments () {
  return {
    type: UPDATE_SEGMENTS,
    segments: []
  }
}

export function updateEditCount (count) {
  return {
    type: UPDATE_EDIT_COUNT,
    count
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
    defaultName: t('street.default-name', 'Unnamed St')
  }
}

export function saveStreetName (streetName, userUpdated) {
  return {
    type: SAVE_STREET_NAME,
    streetName,
    userUpdated
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
