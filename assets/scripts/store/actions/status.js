import { SET_STATUS_MESSAGE, SHOW_NO_CONNECTION_MESSAGE } from './'

export function setStatusMessage (message = null) {
  return {
    type: SET_STATUS_MESSAGE,
    message
  }
}

export function showNoConnectionMessage (show = false) {
  return {
    type: SHOW_NO_CONNECTION_MESSAGE,
    noConnectionMessage: show
  }
}
