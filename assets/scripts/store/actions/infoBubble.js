import {
  SHOW_INFO_BUBBLE,
  HIDE_INFO_BUBBLE,
  SET_SEGMENT_DATA_NO,
  UPDATE_HOVER_POLYGON
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

export function setInfoBubbleSegmentDataNo (dataNo) {
  return {
    type: SET_SEGMENT_DATA_NO,
    dataNo: window.parseInt(dataNo)
  }
}

export function updateHoverPolygon (polygon) {
  return {
    type: UPDATE_HOVER_POLYGON,
    hoverPolygon: polygon
  }
}
