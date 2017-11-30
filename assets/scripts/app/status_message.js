import store from '../store'
import { showStatusMessage as show, hideStatusMessage as hide } from '../store/actions/status'

export function showStatusMessage (message, undo, signIn) {
  store.dispatch(show(message, undo, signIn))
}

export function hideStatusMessage () {
  if (store.getState().status.showMessage === false) return

  store.dispatch(hide())
}
