import {
  SET_APP_FLAGS,
  START_PRINTING,
  STOP_PRINTING,
  EVERYTHING_LOADED,
  SET_LOCALE
} from '../actions'

const initialState = {
  readOnly: false,
  printing: false,
  everythingLoaded: false,
  contentDirection: 'ltr'
}

const app = (state = initialState, action) => {
  switch (action.type) {
    case SET_APP_FLAGS:
      return {
        ...state,
        ...action.flags
      }
    case START_PRINTING:
      return {
        ...state,
        printing: true
      }
    case STOP_PRINTING:
      return {
        ...state,
        printing: false
      }
    case EVERYTHING_LOADED:
      return {
        ...state,
        everythingLoaded: true
      }
    case SET_LOCALE:
      return {
        ...state,
        contentDirection: (['ar', 'dv', 'fa', 'he'].indexOf(action.locale) > -1) ? 'rtl' : 'ltr'
      }
    default:
      return state
  }
}

export default app
