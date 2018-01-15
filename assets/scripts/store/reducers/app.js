import { SET_APP_FLAGS, SET_PRINTING } from '../actions'
import { EVERYTHING_LOADED } from "../actions/index"

const initialState = {
  readOnly: false,
  printing: false,
  everythingLoaded: false
}

const app = (state = initialState, action) => {
  switch (action.type) {
    case SET_APP_FLAGS:
      const obj = Object.assign({}, state, action)
      delete obj.type // Do not save action type.
      return obj
    case SET_PRINTING:
      return {
        ...state,
        printing: action.printing
      }
    case EVERYTHING_LOADED:
      return {
        ...state,
        everythingLoaded: true
      }
    default:
      return state
  }
}

export default app
