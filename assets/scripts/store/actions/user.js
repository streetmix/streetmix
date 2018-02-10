import {
  SET_USER_SIGN_IN_DATA,
  SET_USER_SIGNED_IN_STATE,
  SET_USER_SIGN_IN_LOADED_STATE,
  GEOLOCATION_ATTEMPTED,
  GEOLOCATION_DATA,
  REMEMBER_USER_PROFILE
} from './index'

export function createSetSignInData (data) {
  return {
    type: SET_USER_SIGN_IN_DATA,
    signInData: data
  }
}

export function createSignedInState (bool) {
  return {
    type: SET_USER_SIGNED_IN_STATE,
    signedIn: bool
  }
}

export function createSignInLoadedState (bool) {
  return {
    type: SET_USER_SIGN_IN_LOADED_STATE,
    signInLoaded: bool
  }
}

export function setGeolocationAttempted (attempted = true) {
  return {
    type: GEOLOCATION_ATTEMPTED,
    attempted
  }
}

export function setGeolocationData (data) {
  return {
    type: GEOLOCATION_DATA,
    data
  }
}

export function rememberUserProfile (profile) {
  return {
    type: REMEMBER_USER_PROFILE,
    profile
  }
}
