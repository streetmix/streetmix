import store from '../store'
import { everythingLoaded } from '../store/slices/app.js'
import { showError as showErrorAction } from '../store/slices/errors.js'

export const ERRORS = {
  // Server should be handling 404 errors, but we will keep the generic
  // NOT_FOUND error as a backup. It can handle race conditions: e.g. a street
  // exists, routing is then passed to client, but then the street is deleted
  // just before it is loaded.
  NOT_FOUND: 1,
  SIGN_OUT: 2,
  NO_STREET: 3, // for gallery if you delete the street you were looking at
  FORCE_RELOAD_SIGN_IN: 4,
  FORCE_RELOAD_SIGN_OUT: 5,
  STREET_DELETED_ELSEWHERE: 6,
  NEW_STREET_SERVER_FAILURE: 7,
  // ACCESS_DENIED: 9, // Deprecated. Do not use
  // AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN: 10, // Deprecated. Do not use
  // AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN: 11, // Deprecated. Do not use
  // AUTH_PROBLEM_API_PROBLEM: 12, // Deprecated. Do not use
  GENERIC_ERROR: 13,
  UNSUPPORTED_BROWSER: 14, // Deprecated. Do not use
  // The following 404/410 errors were deprecated on the client. Do not use
  // STREET_404: 15,
  // STREET_404_BUT_LINK_TO_USER: 16,
  // STREET_410_BUT_LINK_TO_USER: 17,
  // CANNOT_CREATE_NEW_STREET_ON_PHONE: 18, /* Deprecated. Do not use */
  SIGN_IN_SERVER_FAILURE: 19,
  SIGN_IN_401: 20,
  STREET_DATA_FAILURE: 21,
  GALLERY_STREET_FAILURE: 22,
  // AUTH_PROBLEM_NO_ACCESS_TOKEN: 23, // Deprecated. Do not use
  AUTH_EXPIRED: 24,
} as const

type ErrorType = (typeof ERRORS)[keyof typeof ERRORS]

export function showError(errorType: ErrorType, newAbortEverything: boolean) {
  // Dispatch everythingLoaded to hide the loading window
  // for cases where error appears immediately on load
  store.dispatch(everythingLoaded())
  store.dispatch(showErrorAction(errorType, newAbortEverything))
}
