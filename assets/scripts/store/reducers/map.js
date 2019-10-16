import { SET_MAP_STATE, RESET_MAP_STATE, CLEAR_LOCATION } from '../actions'

const initialState = {
  markerLocation: null,
  addressInformation: {},
  rawInputString: null
}

const map = (state = initialState, action) => {
  switch (action.type) {
    case SET_MAP_STATE: {
      const obj = Object.assign({}, state, action)
      delete obj.type // Do not save action type.
      return obj
    }
    case RESET_MAP_STATE:
    case CLEAR_LOCATION: // If location is cleared from the street, also reset map state.
      return initialState
    default:
      return state
  }
}

export default map
