import {
  SHOW_INFO_BUBBLE,
  HIDE_INFO_BUBBLE,
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
