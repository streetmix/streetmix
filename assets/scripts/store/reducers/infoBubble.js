import { SHOW_INFO_BUBBLE, HIDE_INFO_BUBBLE, SET_SEGMENT_DATA_NO } from '../actions'

const initialState = {
  visible: false,
  dataNo: null
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
        visible: false
      }
    case SET_SEGMENT_DATA_NO:
      return {
        ...state,
        dataNo: action.dataNo
      }
    default:
      return state
  }
}

export default infoBubble
