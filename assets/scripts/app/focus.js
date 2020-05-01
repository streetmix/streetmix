import { fetchStreetForVerification } from '../streets/xhr'
import store from '../store'
import { updateSettings } from '../store/slices/settings'

export function addPageVisibilityChangeListeners () {
  // Add event listeners to handle when a window is switched away from view,
  // then returns to view again. If the Page Visibility API exists, we use this.
  // If the Page Visibility API does not exist (or is vendor-prefixed in much
  // older browsers), use the much-less-precise `focus` event.
  if (typeof document.hidden !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibilityChange, false)
  } else {
    window.addEventListener('focus', onWindowFocus)
  }
}

export function onWindowFocus () {
  const state = store.getState()
  if (state.errors.abortEverything || state.gallery.visible) {
    return
  }

  fetchStreetForVerification()

  // Save settings on window focus, so the last edited street is the one you’re
  // currently looking at (in case you’re looking at many streets in various
  // tabs). We don't pass in any new settings to save, but calling this does
  // trigger mirroring the app state to localstorage and user account.
  store.dispatch(updateSettings())
}

function onVisibilityChange () {
  if (document.visibilityState !== 'hidden') {
    onWindowFocus()
  }
}
