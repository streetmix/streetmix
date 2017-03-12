import { SET_USER_SETTINGS } from '../actions'
// Note: turning this constant on runs too much side-effect code too early.
// import { NEW_STREET_DEFAULT } from '../../streets/creation'

const initialState = {
  lastStreetId: null,
  lastStreetNamespacedId: null,
  lastStreetCreatorId: null,
  priorLastStreetId: null, // NOTE: Do not save to localstorage or server side, only used for current client session
  newStreetPreference: 1, // TODO: use NEW_STREET_DEFAULT constant

  saveAsImageTransparentSky: false,
  saveAsImageSegmentNamesAndWidths: false,
  saveAsImageStreetName: false
}

const user = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_SETTINGS:
      const obj = Object.assign({}, state, action)
      delete obj.type // Do not save action type.
      return obj
    default:
      return state
  }
}

export default user
