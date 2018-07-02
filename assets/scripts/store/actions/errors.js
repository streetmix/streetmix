import {
  SHOW_ERROR,
  HIDE_ERROR
} from './'

export function showError (errorType, abortEverything) {
  return {
    type: SHOW_ERROR,
    errorType,
    abortEverything: !!abortEverything
  }
}

export function hideError () {
  return {
    type: HIDE_ERROR
  }
}
