import { SHOW_DIALOG, CLEAR_DIALOGS } from './index'

export function showDialog (name) {
  return {
    type: SHOW_DIALOG,
    name
  }
}

export function handleClearDialogs () {
  return {
    type: CLEAR_DIALOGS
  }
}
