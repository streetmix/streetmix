import { SHOW_NO_CONNECTION_MESSAGE } from './'

export function showNoConnectionMessage (show = false) {
  return {
    type: SHOW_NO_CONNECTION_MESSAGE,
    noConnectionMessage: show
  }
}
