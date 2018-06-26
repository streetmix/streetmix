import {
  SHOW_INFO_BUBBLE,
  HIDE_INFO_BUBBLE,
  SET_INFO_BUBBLE_MOUSE_INSIDE,
  START_PRINTING,
  SHOW_DESCRIPTION,
  HIDE_DESCRIPTION
} from '../actions'

const initialState = {
  visible: false,
  mouseInside: false,
  descriptionVisible: false,

  // Bubble dimensions
  bubbleX: null,
  bubbleY: null,
  bubbleWidth: null,
  bubbleHeight: null
}

const infoBubble = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_INFO_BUBBLE:
      return {
        ...state,
        visible: true,
        // Reset description visibility, as well
        descriptionVisible: false
      }
    case HIDE_INFO_BUBBLE:
    case START_PRINTING: // Also hide when printing
      return {
        ...state,
        visible: false,
        // Auto-hide description, as well
        descriptionVisible: false,
        // When hidden, mouse is never considered to be "inside"
        mouseInside: false
      }
    case SET_INFO_BUBBLE_MOUSE_INSIDE:
      return {
        ...state,
        mouseInside: action.value
      }
    case SHOW_DESCRIPTION:
      return {
        ...state,
        descriptionVisible: true
      }
    case HIDE_DESCRIPTION:
      return {
        ...state,
        descriptionVisible: false
      }
    default:
      return state
  }
}

export default infoBubble
