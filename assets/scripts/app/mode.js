import { ERRORS, showError, showErrorFromUrl } from './errors'
import { setServerContacted } from './initialization'
import { getErrorUrl } from './page_url'

export const MODES = {
  CONTINUE: 1,
  NEW_STREET: 2,
  NEW_STREET_COPY_LAST: 3,
  JUST_SIGNED_IN: 4,
  EXISTING_STREET: 5,
  NOT_FOUND: 6,
  SIGN_OUT: 7,
  FORCE_RELOAD_SIGN_IN: 8,
  FORCE_RELOAD_SIGN_OUT: 9,
  USER_GALLERY: 10,
  GLOBAL_GALLERY: 11,
  ERROR: 13,
  UNSUPPORTED_BROWSER: 14, // Deprecated. Do not use.
  STREET_404: 15,
  STREET_404_BUT_LINK_TO_USER: 16,
  STREET_410_BUT_LINK_TO_USER: 17,
  ABOUT: 18,
  AUTH_EXPIRED: 19,
  SURVEY_FINISHED: 20
}

let mode

export function getMode () {
  return mode
}

export function setMode (value) {
  mode = value
}

export function processMode () {
  setServerContacted(true)

  switch (mode) {
    case MODES.ERROR:
      showErrorFromUrl(getErrorUrl())
      break
    // Deprecated
    case MODES.UNSUPPORTED_BROWSER:
      showError(ERRORS.UNSUPPORTED_BROWSER, true)
      break
    case MODES.AUTH_EXPIRED:
      showError(ERRORS.AUTH_EXPIRED, true)
      break
    case MODES.NOT_FOUND:
      showError(ERRORS.NOT_FOUND, true)
      break
    case MODES.STREET_404:
      showError(ERRORS.STREET_404, true)
      break
    case MODES.STREET_404_BUT_LINK_TO_USER:
      showError(ERRORS.STREET_404_BUT_LINK_TO_USER, true)
      break
    case MODES.STREET_410_BUT_LINK_TO_USER:
      showError(ERRORS.STREET_410_BUT_LINK_TO_USER, true)
      break
    case MODES.SIGN_OUT:
      showError(ERRORS.SIGN_OUT, true)
      break
    case MODES.FORCE_RELOAD_SIGN_OUT:
      showError(ERRORS.FORCE_RELOAD_SIGN_OUT, true)
      break
    case MODES.FORCE_RELOAD_SIGN_IN:
      showError(ERRORS.FORCE_RELOAD_SIGN_IN, true)
      break
    case MODES.NEW_STREET:
      setServerContacted(false)
      break
    case MODES.NEW_STREET_COPY_LAST:
      setServerContacted(false)
      break
    case MODES.CONTINUE:
    case MODES.USER_GALLERY:
    case MODES.GLOBAL_GALLERY:
      setServerContacted(false)
      break
    case MODES.JUST_SIGNED_IN:
      setServerContacted(false)
      break
    case MODES.SURVEY_FINISHED:
      setServerContacted(false)
      break
    case MODES.EXISTING_STREET:
      setServerContacted(false)
      break
  }
}
