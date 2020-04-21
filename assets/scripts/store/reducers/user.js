import {
  SET_USER_SIGN_IN_DATA,
  SET_USER_SIGNED_IN_STATE,
  SET_USER_SIGN_IN_LOADED_STATE,
  GEOLOCATION_ATTEMPTED,
  GEOLOCATION_DATA,
  REMEMBER_USER_PROFILE
} from '../actions'

const initialState = {
  signInData: null,
  signedIn: false,
  signInLoaded: false,
  geolocation: {
    attempted: false,
    data: null
  },
  profileCache: {}
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
      return {
        ...state,
        geolocation: {
          ...state.geolocation,
          attempted: action.attempted
        }
      }
    }
    case GEOLOCATION_DATA: {
      return {
        ...state,
        geolocation: {
          ...state.geolocation,
          data: action.data
        }
      }
    }
    case REMEMBER_USER_PROFILE: {
      // Prevent a case where a bad action results in a corrupted cache
      if (!action.profile || !action.profile.id) return state

      return {
        ...state,
        profileCache: {
          ...state.profileCache,
          [action.profile.id]: action.profile
        }
      }
    }
    default:
      return state
  }
}

export default settings
