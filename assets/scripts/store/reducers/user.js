import { SET_USER_SETTINGS } from '../actions'
// import { NEW_STREET_DEFAULT } from '../../streets/creation'

const initialState = {
  lastStreetId: null,
  lastStreetNamespacedId: null,
  lastStreetCreatorId: null,
  priorLastStreetId: null, // Do not save
  newStreetPreference: 1,

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
