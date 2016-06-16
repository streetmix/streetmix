/* global system, abortEverything, _saveSettingsLocally */

import { galleryState } from '../gallery/view'
import { hideAllMenus } from '../menus/menu'
import { fetchStreetForVerification } from '../streets/xhr'

window.addEventListener('stmx:everything_loaded', function () {
  if (system.pageVisibility) {
    document.addEventListener(system.visibilityChange, onVisibilityChange, false)
  } else {
    window.addEventListener('focus', onWindowFocus)
    window.addEventListener('blur', onWindowBlur)
  }
})

/**
 * Refocusing on the body immediately after some other element is
 * removed from the page allows the application to continue to receive
 * keydown events. (Otherwise the browser could capture those events
 * and do browser default actions instead.)
 * However, loseAnyFocus() is very aggressive, because if it is called at
 * the wrong time, it could cause the user to lose focus on something
 * (like an input box) improperly, so be very careful when using it.
 */
export function loseAnyFocus () {
  document.body.focus()
}

export function isFocusOnBody () {
  return document.activeElement === document.body
}

export function onWindowFocus () {
  if (abortEverything || galleryState.visible) {
    return
  }

  fetchStreetForVerification()

  // Save settings on window focus, so the last edited street is the one you’re
  // currently looking at (in case you’re looking at many streets in various
  // tabs)
  _saveSettingsLocally()
}

function onWindowBlur () {
  if (abortEverything) {
    return
  }

  hideAllMenus()
}

function onVisibilityChange () {
  if (document[system.visibilityState] === 'hidden') {
    onWindowBlur()
  } else {
    onWindowFocus()
  }
}
