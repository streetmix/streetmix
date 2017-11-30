import {
  SHOW_STATUS_MESSAGE,
  HIDE_STATUS_MESSAGE,
  SHOW_NO_CONNECTION_MESSAGE
} from './'

export function showStatusMessage (message = null, undo = false, signIn = false) {
  return {
    type: SHOW_STATUS_MESSAGE,
    message,
    undo,
    signIn
  }
}

export function hideStatusMessage () {
  return {
    type: HIDE_STATUS_MESSAGE
  }
}

export function showNoConnectionMessage (show = false) {
  return {
    type: SHOW_NO_CONNECTION_MESSAGE,
    noConnectionMessage: show
  }
}
