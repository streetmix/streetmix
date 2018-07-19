import { SITE_URL } from '../app/config'
import store from '../store'
import { setGeolocationAttempted, setGeolocationData } from '../store/actions/user'

const IP_GEOLOCATION_API_URL = `${SITE_URL}services/geoip`

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

export function detectGeolocation () {
  // Reset state
  store.dispatch(setGeolocationAttempted(false))
  return fetchGeolocation()
    .catch(() => {
      geolocationAttempted()
    })
}

/**
 * Fetches geolocation data from remote endpoint. If successful, dispatches
 * data to store.
 *
 * @returns {Promise} - resolved with value of data
 */
async function fetchGeolocation () {
  const response = await window.fetch(IP_GEOLOCATION_API_URL)
  if (!response.ok) {
    throw new Error(response.status)
  }

  const data = await response.json()

  // Note: it's possible to receive this information late, after
  // the timeout, but we keep it anyway
  geolocationAttempted()
  store.dispatch(setGeolocationData(data))
  return data
}
