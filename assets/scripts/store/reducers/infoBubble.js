import {
  SHOW_INFO_BUBBLE,
  HIDE_INFO_BUBBLE,
  UPDATE_HOVER_POLYGON,
  SET_INFO_BUBBLE_MOUSE_INSIDE,
  SHOW_DESCRIPTION,
  HIDE_DESCRIPTION
} from '../actions'
import { startPrinting } from '../slices/app'

const initialState = {
  visible: false,
  mouseInside: false,
  descriptionVisible: false,
  hoverPolygon: [],

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
    case startPrinting.type: // Also hide when printing
      return {
        ...state,
        visible: false,
        // Auto-hide description, as well
        descriptionVisible: false,
        // When hidden, mouse is never considered to be "inside"
        mouseInside: false
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
