import {
  SHOW_STREET_NAME_CANVAS,
  HIDE_STREET_NAME_CANVAS,
  SET_UNIT_SETTINGS,
  SET_ACTIVE_SEGMENT,
  UPDATE_DRAGGING_STATE,
  CLEAR_DRAGGING_STATE,
  SET_DRAGGING_TYPE
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
