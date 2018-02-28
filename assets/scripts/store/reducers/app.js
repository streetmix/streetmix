import { SET_APP_FLAGS, START_PRINTING, STOP_PRINTING, EVERYTHING_LOADED } from '../actions'

const initialState = {
  readOnly: false,
  printing: false,
  everythingLoaded: false
}

const app = (state = initialState, action) => {
  switch (action.type) {
    case SET_APP_FLAGS:
      return {
        ...state,
        ...action.flags
      }
    case START_PRINTING: {
      return {
        ...state,
        printing: true
      }
    }
    case STOP_PRINTING: {
      return {
        ...state,
        printing: false
      }
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
