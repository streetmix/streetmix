import store from '../store'
import { showStatusMessage as show, hideStatusMessage as hide } from '../store/actions/status'
import { registerKeypress, deregisterKeypress } from './keypress'

const STATUS_MESSAGE_HIDE_DELAY = 15000

let timerId = -1

export function showStatusMessage (message, undo) {
  window.clearTimeout(timerId)

  store.dispatch(show(message, undo))

  timerId = window.setTimeout(hideStatusMessage, STATUS_MESSAGE_HIDE_DELAY)

  // Set up keypress listener to close debug window
  registerKeypress('esc', hideStatusMessage)
}

export function hideStatusMessage () {
  if (store.getState().status.showMessage === false) {
    return
  }

  store.dispatch(hide())

  deregisterKeypress('esc', hideStatusMessage)
}
