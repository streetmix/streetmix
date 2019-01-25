import {
  SHOW_STREET_NAME_CANVAS,
  HIDE_STREET_NAME_CANVAS,
  SET_UNIT_SETTINGS,
  SET_ACTIVE_SEGMENT,
  UPDATE_DRAGGING_STATE,
  CLEAR_DRAGGING_STATE,
  SET_DRAGGING_TYPE,
  SEGMENT_IS_RESIZING,
  TOGGLE_TOOLBOX
} from './index'

export function showStreetNameCanvas () {
  return {
    type: SHOW_STREET_NAME_CANVAS
  }
}

export function hideStreetNameCanvas () {
  return {
    type: HIDE_STREET_NAME_CANVAS
  }
}

export function setUnitSettings (unit) {
  return {
    type: SET_UNIT_SETTINGS,
    unit
  }
}

export function setActiveSegment (position) {
  const isBuilding = (position === 'left' || position === 'right')
  return {
    type: SET_ACTIVE_SEGMENT,
    position: (isBuilding) ? position : Number.parseInt(position, 10)
  }
}

export function updateDraggingState (segmentBeforeEl, segmentAfterEl, draggedSegment) {
  return {
    type: UPDATE_DRAGGING_STATE,
    segmentBeforeEl,
    segmentAfterEl,
    draggedSegment
  }
}

export function clearDraggingState () {
  return {
    type: CLEAR_DRAGGING_STATE
  }
}

export function setDraggingType (draggingType) {
  return {
    type: SET_DRAGGING_TYPE,
    draggingType
  }
}

/**
 * Updates when a segment is being resized.
 *
 * @param {Boolean} isResizing - whether the resize action is being performed
 */
export function setSegmentIsResizing (isResizing) {
  return {
    type: SEGMENT_IS_RESIZING,
    isResizing
  }
}

export function toggleToolbox () {
  return {
    type: TOGGLE_TOOLBOX
  }
}
