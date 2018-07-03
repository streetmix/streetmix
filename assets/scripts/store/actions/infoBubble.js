import {
  SHOW_INFO_BUBBLE,
  HIDE_INFO_BUBBLE,
  UPDATE_HOVER_POLYGON,
  SET_INFO_BUBBLE_MOUSE_INSIDE,
  SHOW_DESCRIPTION,
  HIDE_DESCRIPTION
} from '../actions'

export function showInfoBubble () {
  return {
    type: SHOW_INFO_BUBBLE
  }
}

export function hideInfoBubble () {
  return {
    type: HIDE_INFO_BUBBLE
  }
}

export function updateHoverPolygon (polygon) {
  return {
    type: UPDATE_HOVER_POLYGON,
    hoverPolygon: polygon
  }
}

export function setInfoBubbleMouseInside (bool) {
  return {
    type: SET_INFO_BUBBLE_MOUSE_INSIDE,
    value: bool
  }
}

export function showDescription () {
  return {
    type: SHOW_DESCRIPTION
  }
}

export function hideDescription () {
  return {
    type: HIDE_DESCRIPTION
  }
}
