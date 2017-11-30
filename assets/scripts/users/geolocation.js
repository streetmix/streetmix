import { trackEvent } from '../app/event_tracking'
import store from '../store'
import { setGeolocationAttempted, setGeolocationData } from '../store/actions/user'

const IP_GEOLOCATION_API_URL = 'https://freegeoip.net/json/'
const IP_GEOLOCATION_TIMEOUT = 1000 // After this time, we don’t wait any more
const GEOLOCATION_TIMEOUT_MESSAGE = 'Geolocation request timed out.'

/**
 * Checks the store to see if geolocation service attempt was made. It does
 * not mean the attempt was successful.
 *
 * @return {Boolean}
 */
export function wasGeolocationAttempted () {
  return store.getState().user.geolocation.attempted
}

/**
 * Marks geolocation attempted, used to represent a completed, timed-out or
 * failed geolocation attempt
 */
export function geolocationAttempted () {
  store.dispatch(setGeolocationAttempted(true))
}

/**
 * Requests geolocation from remote IP geolocation service. Runs a Promise.race
 * which resolves with either the result of `fetchGeolocation` or
 * `fetchGeolocationTimeout` after IP_GEOLOCATION_TIMEOUT milliseconds.
 * If an error is caught, mark geolocation attempted and re-throw the error.
 *
 * @returns {Promise} - resolved with value of either race function
 */
export function detectGeolocation () {
  // Reset state
  store.dispatch(setGeolocationAttempted(false))

  // Fetch geolocation data; return Promise to caller
  // It resolves with either the result of the fetch or times out if it takes too long
  return Promise.race([ fetchGeolocation(), fetchGeolocationTimeout() ])
    .catch(() => {
      // If errored, fail silently but mark geolocation as attempted.
      // Geolocation attempts may fail if third-party service is
      // blocked by uBlock or other ad/tracker blockers.
      geolocationAttempted()
    })
}

/**
 * Fetches geolocation data from remote endpoint. If successful, dispatches
 * data to store.
 *
 * @returns {Promise} - resolved with value of data
 */
function fetchGeolocation () {
  return window.fetch(IP_GEOLOCATION_API_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status)
      }

      return response.json()
    })
    .then(data => {
      // Note: it's possible to receive this information late, after
      // the timeout, but we keep it anyway
      geolocationAttempted()
      store.dispatch(setGeolocationData(data))
      return data
    })
}

/**
 * A function that resolves after IP_GEOLOCATION_TIMEOUT milliseconds with
 * an object { timeout: true, message: <string> }. If `fetchGeolocation()` takes
 * too long, this returns a value first.
 *
 * @returns {Promise} - resolved with a timeout object.
 */
function fetchGeolocationTimeout () {
  return new Promise((resolve, reject) => {
    return window.setTimeout(() => {
      if (wasGeolocationAttempted() === false) {
        trackEvent('ERROR', 'ERROR_GEOLOCATION_TIMEOUT', null, null, false)
        geolocationAttempted()
        console.warn(GEOLOCATION_TIMEOUT_MESSAGE)
      }

      return resolve({ timeout: true, message: GEOLOCATION_TIMEOUT_MESSAGE })
    }, IP_GEOLOCATION_TIMEOUT)
  })
}
