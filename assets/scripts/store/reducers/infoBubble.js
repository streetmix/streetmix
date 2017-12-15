import {
  SHOW_INFO_BUBBLE,
  HIDE_INFO_BUBBLE,
  SET_SEGMENT_DATA_NO,
  UPDATE_HOVER_POLYGON,
  SET_INFO_BUBBLE_MOUSE_INSIDE
} from '../actions'

const initialState = {
  visible: false,
  mouseInside: false,
  dataNo: null,
  hoverPolygon: []
}

const infoBubble = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_INFO_BUBBLE:
      return {
        ...state,
        visible: true
      }
    case HIDE_INFO_BUBBLE:
      return {
        ...state,
        visible: false,
        // When hidden, mouse is never considered to be "inside"
        mouseInside: false
      }
    case SET_SEGMENT_DATA_NO:
      return {
        ...state,
        dataNo: action.dataNo
      }
    case UPDATE_HOVER_POLYGON:
      return {
        ...state,
        hoverPolygon: action.hoverPolygon
      }
    case SET_INFO_BUBBLE_MOUSE_INSIDE:
      return {
        ...state,
        mouseInside: action.value
      }
    default:
      return state
  }
}

export default infoBubble
