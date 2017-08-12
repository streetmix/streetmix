import {
  SET_USER_SIGN_IN_DATA,
  SET_USER_SIGNED_IN_STATE,
  SET_USER_SIGN_IN_LOADED_STATE,
  SET_GEOLOCATION_STATE
} from '../actions'

const initialState = {
  signInData: null,
  signedIn: false,
  signInLoaded: false,
  geolocation: {
    loaded: false,
    data: null
  }
}

const settings = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_SIGN_IN_DATA:
      return {
        ...state,
        signInData: action.signInData
      }
    case SET_USER_SIGNED_IN_STATE:
      return {
        ...state,
        signedIn: action.signedIn
      }
    case SET_USER_SIGN_IN_LOADED_STATE:
      return {
        ...state,
        signInLoaded: action.signInLoaded
      }
    case SET_GEOLOCATION_STATE:
      const obj = Object.assign({}, state.geolocation, action)
      delete obj.type // Do not save action type.
      return {
        ...state,
        geolocation: obj
      }
    default:
      return state
  }
}

export default settings
