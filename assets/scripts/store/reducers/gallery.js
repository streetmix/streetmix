import {
  SHOW_GALLERY,
  HIDE_GALLERY,
  RECEIVE_GALLERY_STREETS,
  DELETE_GALLERY_STREET,
  SET_GALLERY_STATE } from '../actions'

const initialState = {
  visible: false,
  userId: null,

  // Available modes:
  // NONE - null state
  // SIGN_IN_PROMO - user is not signed in, show a message promoting it
  // LOADING - loading streets from server
  // ERROR - there is an error loading streets from server
  // GALLERY - displaying street gallery
  mode: 'NONE',
  streets: []
}

const gallery = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_GALLERY:
      return {
        ...state,
        visible: true
      }
    case HIDE_GALLERY:
      return {
        ...state,
        visible: false
      }
    case RECEIVE_GALLERY_STREETS:
      return {
        ...state,
        streets: action.streets
      }
    case DELETE_GALLERY_STREET:
      return {
        ...state,
        streets: state.streets.filter((street) => {
          return street.id !== action.id
        })
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
