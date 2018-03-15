import { SET_USER_UNITS, SET_LOCALE } from '../actions'

const initialState = {
  units: 1,
  locale: null
}

const persistSettings = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_UNITS:
      return {
        ...state,
        units: action.units
      }
    case SET_LOCALE:
      return {
        ...state,
        locale: action.locale
      }
    default:
      return state
  }
}

export default persistSettings
