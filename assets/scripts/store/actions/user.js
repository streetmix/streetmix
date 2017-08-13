import { SET_GEOLOCATION_STATE } from './index'

export function setGeolocationLoading () {
  return {
    type: SET_GEOLOCATION_STATE,
    loaded: false,
    data: null
  }
}

export function setGeolocationData (data) {
  return {
    type: SET_GEOLOCATION_STATE,
    loaded: true,
    data: data
  }
}
