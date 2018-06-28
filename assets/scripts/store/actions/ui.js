import {
  SHOW_STREET_NAME_CANVAS,
  HIDE_STREET_NAME_CANVAS,
  SET_UNIT_SETTINGS,
  SET_ACTIVE_SEGMENT
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
