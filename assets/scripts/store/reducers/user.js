import {
  SET_USER_SIGN_IN_DATA,
  SET_USER_SIGNED_IN_STATE,
  SET_USER_SIGN_IN_LOADED_STATE,
  GEOLOCATION_ATTEMPTED,
  GEOLOCATION_DATA
} from '../actions'

const initialState = {
  signInData: null,
  signedIn: false,
  signInLoaded: false,
  geolocation: {
    attempted: false,
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
    case GEOLOCATION_ATTEMPTED: {
      const obj = Object.assign({}, state)
      obj.geolocation.attempted = action.attempted
      return obj
    }
    case GEOLOCATION_DATA: {
      const obj = Object.assign({}, state)
      obj.geolocation.data = action.data
      return obj
    }
    default:
      return state
  }
}

export default settings
