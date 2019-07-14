import {
  SHOW_INFO_BUBBLE,
  HIDE_INFO_BUBBLE,
  UPDATE_HOVER_POLYGON,
  SET_INFO_BUBBLE_MOUSE_INSIDE,
  SHOW_DESCRIPTION,
  HIDE_DESCRIPTION
} from '../actions'

/**
 * Conditionally dispatches `SHOW_INFO_BUBBLE` only if info bubble is not visible.
 */
export function showInfoBubble () {
  return (dispatch, getState) => {
    if (getState().infoBubble.visible === false) {
      dispatch({ type: SHOW_INFO_BUBBLE })
    }
  }
}

/**
 * Conditionally dispatches `HIDE_INFO_BUBBLE` only if info bubble is visible.
 */
export function hideInfoBubble () {
  return (dispatch, getState) => {
    if (getState().infoBubble.visible === true) {
      dispatch({ type: HIDE_INFO_BUBBLE })
    }
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
