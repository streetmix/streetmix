import { fetchStreetForVerification } from '../streets/xhr'
import { saveSettingsLocally } from '../users/settings'
import store from '../store'

window.addEventListener('stmx:everything_loaded', function () {
  const system = store.getState().system

  if (system.pageVisibility) {
    document.addEventListener(system.visibilityChange, onVisibilityChange, false)
  } else {
    window.addEventListener('focus', onWindowFocus)
  }
})

export function onWindowFocus () {
  const state = store.getState()
  if (state.errors.abortEverything || state.gallery.visible) {
    return
  }

  fetchStreetForVerification()

  // Save settings on window focus, so the last edited street is the one you’re
  // currently looking at (in case you’re looking at many streets in various
  // tabs)
  saveSettingsLocally()
}

function onVisibilityChange () {
  const system = store.getState().system

  if (document[system.visibilityState] !== 'hidden') {
    onWindowFocus()
  }
}
