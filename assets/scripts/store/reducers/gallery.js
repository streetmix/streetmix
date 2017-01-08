import { SHOW_GALLERY, SET_GALLERY_STATE } from '../actions'

const initialState = {
  visible: false,
  userId: null,
  signInPromo: false
}

const gallery = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_GALLERY:
      return {
        ...state,
        visible: true
      }
    // This action allows setting arbitrary properties directly to the state
    // object. The only property we don't want to copy is `type`, which is
    // only used here to specify the action type. Make sure we combine incoming
    // properties with existing properties.
    case SET_GALLERY_STATE:
      const settingsObj = Object.assign({}, state, action)
      delete settingsObj.type
      return { ...settingsObj }
    default:
      return state
  }
}

export default gallery
