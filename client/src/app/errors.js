import store from '../store'
import { everythingLoaded } from '../store/slices/app'
import { showError as showErrorAction } from '../store/slices/errors'
import {
  URL_ERROR_NO_TWITTER_REQUEST_TOKEN,
  URL_ERROR_NO_TWITTER_ACCESS_TOKEN,
  URL_ERROR_NO_ACCESS_TOKEN,
  URL_ERROR_AUTHENTICATION_API_PROBLEM,
  URL_ERROR_ACCESS_DENIED,
} from './constants'

export const ERRORS = {
  NOT_FOUND: 1,
  SIGN_OUT: 2,
  NO_STREET: 3, // for gallery if you delete the street you were looking at
  FORCE_RELOAD_SIGN_IN: 4,
  FORCE_RELOAD_SIGN_OUT: 5,
  STREET_DELETED_ELSEWHERE: 6,
  NEW_STREET_SERVER_FAILURE: 7,
  ACCESS_DENIED: 9,
  AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN: 10,
  AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN: 11,
  AUTH_PROBLEM_API_PROBLEM: 12,
  GENERIC_ERROR: 13,
  UNSUPPORTED_BROWSER: 14, // Deprecated. Do not use
  STREET_404: 15,
  STREET_404_BUT_LINK_TO_USER: 16,
  STREET_410_BUT_LINK_TO_USER: 17,
  // CANNOT_CREATE_NEW_STREET_ON_PHONE: 18, /* Deprecated. Do not use */
  SIGN_IN_SERVER_FAILURE: 19,
  SIGN_IN_401: 20,
  STREET_DATA_FAILURE: 21,
  GALLERY_STREET_FAILURE: 22,
  AUTH_PROBLEM_NO_ACCESS_TOKEN: 23,
  AUTH_EXPIRED: 24,
}

export function showError(errorType, newAbortEverything) {
  // Dispatch everythingLoaded to hide the loading window
  // for cases where error appears immediately on load
  store.dispatch(everythingLoaded())
  store.dispatch(showErrorAction(errorType, newAbortEverything))
}

export function showErrorFromUrl(errorUrl) {
  let errorType

  // TODO const
  switch (errorUrl) {
    case URL_ERROR_NO_TWITTER_REQUEST_TOKEN:
      errorType = ERRORS.AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN
      break
    case URL_ERROR_NO_TWITTER_ACCESS_TOKEN:
      errorType = ERRORS.AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN
      break
    case URL_ERROR_NO_ACCESS_TOKEN:
      errorType = ERRORS.AUTH_PROBLEM_NO_ACCESS_TOKEN
      break
    case URL_ERROR_AUTHENTICATION_API_PROBLEM:
      errorType = ERRORS.AUTH_PROBLEM_API_PROBLEM
      break
    case URL_ERROR_ACCESS_DENIED:
      errorType = ERRORS.ACCESS_DENIED
      break
    default:
      errorType = ERRORS.GENERIC_ERROR
      break
  }

  showError(errorType, true)
}
