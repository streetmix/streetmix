import {
  SHOW_STREET_NAME_CANVAS,
  HIDE_STREET_NAME_CANVAS,
  SET_ACTIVE_SEGMENT,
  INIT_DRAGGING_STATE,
  UPDATE_DRAGGING_STATE,
  CLEAR_DRAGGING_STATE,
  SET_DRAGGING_TYPE,
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

export function setActiveSegment (position) {
  const isBuilding = (position === 'left' || position === 'right')
  return {
    type: SET_ACTIVE_SEGMENT,
    position: (isBuilding) ? position : Number.parseInt(position, 10)
  }
}

/**
 * Inititalizes a dragging state with a provided `draggingType`.
 * This initalizes both `draggingState` and `draggingType` in the reducer in one dispatched action,
 * so you shouldn't need to call `setDraggingType` and `updateDraggingState` simultaneously.
 *
 * @param {Number} draggingType
 */
export function initDraggingState (draggingType) {
  return {
    type: INIT_DRAGGING_STATE,
    draggingType
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

export function toggleToolbox () {
  return {
    type: TOGGLE_TOOLBOX
  }
}
