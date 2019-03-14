import { SET_USER_SETTINGS } from '../actions'

// TODO: the following imported module has been commented out because something
// in its import tree runs some side-effect code too early, before it's ready to.
// We would like to depend on the NEW_STREET_DEFAULT constant in the future.
// import { NEW_STREET_DEFAULT } from '../../streets/creation'

const initialState = {
  lastStreetId: null,
  lastStreetNamespacedId: null,
  lastStreetCreatorId: null,
  priorLastStreetId: null, // NOTE: Do not save to localstorage or server side, only used for current client session
  newStreetPreference: 1, // TODO: use NEW_STREET_DEFAULT constant

  saveAsImageTransparentSky: false,
  saveAsImageSegmentNamesAndWidths: false,
  saveAsImageStreetName: false,
  saveAsImageWatermark: true
}

const settings = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_SETTINGS:
      return Object.assign({}, state, action.settings)
    default:
      return state
  }
}

export default settings
