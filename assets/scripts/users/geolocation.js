import {
  checkIfSignInAndGeolocationLoaded,
  updateSettingsFromCountryCode
} from './localization'
import { trackEvent } from '../app/event_tracking'
import { checkIfEverythingIsLoaded } from '../app/initialization'
import { system } from '../preinit/system_capabilities'
import store from '../store'
import {
  setGeolocationLoading,
  setGeolocationData
} from '../store/actions/user'

const IP_GEOLOCATION_API_URL = 'https://freegeoip.net/json/'
const IP_GEOLOCATION_TIMEOUT = 1000 // After this time, we don’t wait any more

export function isGeolocationLoaded () {
  return store.getState().user.geolocation.loaded
}

/**
 * Forces loading state to be set to "true" without data - this represents
 * a timed-out or cancelled geolocation attempt
 */
export function setGeolocationLoaded () {
  store.dispatch(setGeolocationData(null))
}

export function detectGeolocation () {
  // Reset state
  store.dispatch(setGeolocationLoading())

  // Detect and handle timeout
  window.setTimeout(detectGeolocationTimeout, IP_GEOLOCATION_TIMEOUT)

  // Fetch geolocation data; return Promise to caller
  return window.fetch(IP_GEOLOCATION_API_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status)
      }

      return response.json()
    })
    .then(receiveGeolocation)
    .catch((error) => {
      console.log('[detectGeolocation]', error)
    })
}

function receiveGeolocation (info) {
  if (info && info.country_code) {
    updateSettingsFromCountryCode(info.country_code)
  }
  if (info && info.ip) {
    system.ipAddress = info.ip
  }

  store.dispatch(setGeolocationData(info))

  document.querySelector('#loading-progress').value++
  checkIfSignInAndGeolocationLoaded()
  checkIfEverythingIsLoaded()
}

function detectGeolocationTimeout () {
  if (isGeolocationLoaded() === false) {
    setGeolocationLoaded()

    document.querySelector('#loading-progress').value++
    checkIfSignInAndGeolocationLoaded()
    checkIfEverythingIsLoaded()

    trackEvent('ERROR', 'ERROR_GEOLOCATION_TIMEOUT', null, null, false)
  }
}
