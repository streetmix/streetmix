import { SHOW_STREET_NAME_CANVAS, HIDE_STREET_NAME_CANVAS } from '../actions'

const initialState = {
  streetNameCanvasVisible: true
}

const ui = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_STREET_NAME_CANVAS:
      return {
        ...state,
        streetNameCanvasVisible: true
      }
    case HIDE_STREET_NAME_CANVAS:
      return {
        ...state,
        streetNameCanvasVisible: false
      }
    default:
      return state
  }
}

export default ui
