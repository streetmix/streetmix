import { SET_USER_UNITS } from '../actions'

const initialState = {
  units: 1
}

const persistSettings = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_UNITS:
      return {
        ...state,
        units: action.units
      }
    default:
      return state
  }
}

export default persistSettings
