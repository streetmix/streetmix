import { GEOLOCATION_ATTEMPTED, GEOLOCATION_DATA } from './index'

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
