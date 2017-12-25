import { GEOLOCATION_ATTEMPTED, GEOLOCATION_DATA, REMEMBER_USER_PROFILE } from './index'

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
