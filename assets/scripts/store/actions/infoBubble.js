import { SHOW_INFO_BUBBLE, HIDE_INFO_BUBBLE, SET_SEGMENT_DATA_NO } from '../actions'

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
