import { SET_MAP_STATE } from '../actions'

const initialState = {
  markerLocation: null,
  addressInformation: {},
  addressInformationLabel: null,
  rawInputString: null
}

const map = (state = initialState, action) => {
  switch (action.type) {
    case SET_MAP_STATE:
      const obj = Object.assign({}, state, action)
      delete obj.type // Do not save action type.
      return obj
    default:
      return state
  }
}

export default map
