import {
  SHOW_ERROR,
  HIDE_ERROR
} from './'

export function showError (errorType, abortEverything) {
  return {
    type: SHOW_ERROR,
    errorType,
    abortEverything: typeof abortEverything === 'undefined' ? false : abortEverything
  }
}

export function hideError () {
  return {
    type: HIDE_ERROR
  }
}
