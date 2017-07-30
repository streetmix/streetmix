import store from '../store'
import { showStatusMessage as show, hideStatusMessage as hide } from '../store/actions/status'
import { registerKeypress, deregisterKeypress } from './keypress'

const STATUS_MESSAGE_HIDE_DELAY = 15000

let timerId = -1
let isVisible = false

export function attachStatusMessageEventListeners () {
  // As per issue #306.
  window.addEventListener('stmx:save_street', hideStatusMessage)
}

export function showStatusMessage (message, undo) {
  window.clearTimeout(timerId)

  isVisible = true
  store.dispatch(show(message, undo))

  timerId = window.setTimeout(hideStatusMessage, STATUS_MESSAGE_HIDE_DELAY)

  // Set up keypress listener to close debug window
  registerKeypress('esc', hideStatusMessage)
}

export function hideStatusMessage () {
  if (!isVisible) {
    return
  }

  store.dispatch(hide())

  deregisterKeypress('esc', hideStatusMessage)
}
