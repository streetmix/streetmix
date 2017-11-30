import { system } from '../preinit/system_capabilities'
import { fetchStreetForVerification } from '../streets/xhr'
import { saveSettingsLocally } from '../users/settings'
import { getAbortEverything } from './initialization'
import store from '../store'

window.addEventListener('stmx:everything_loaded', function () {
  if (system.pageVisibility) {
    document.addEventListener(system.visibilityChange, onVisibilityChange, false)
  } else {
    window.addEventListener('focus', onWindowFocus)
  }
})

export function onWindowFocus () {
  if (getAbortEverything() || store.getState().gallery.visible) {
    return
  }

  fetchStreetForVerification()

  // Save settings on window focus, so the last edited street is the one you’re
  // currently looking at (in case you’re looking at many streets in various
  // tabs)
  saveSettingsLocally()
}

function onVisibilityChange () {
  if (document[system.visibilityState] !== 'hidden') {
    onWindowFocus()
  }
}
