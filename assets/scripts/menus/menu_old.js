import { registerKeypress } from '../app/keypress'

/**
 * Determine if any of the menus are currently visible.
 * Returns a boolean value.
 */
export function isAnyMenuVisible () {
  const els = document.querySelectorAll('.menu.visible')
  return !(els.length === 0)
}

export function hideAllMenus () {
  const els = document.querySelectorAll('.menu.visible')

  if (els.length > 0) {
    for (let i = 0, j = els.length; i < j; i++) {
      els[i].classList.remove('visible')
    }

    // Force document.body to become the active element. Do not re-focus on
    // document.body if there were no menus to hide.
    document.body.focus()
  }
}

// Hide menus if page loses visibility.
document.addEventListener('visibilitychange', () => {
  if (document.hidden === true) {
    hideAllMenus()
  }
}, false)

// Set up keypress listener to hide menus if visible
// Wrapped in this event right now because this module is required too early
// by other modules, when the `keypress` module is not fully loaded.
window.addEventListener('stmx:everything_loaded', function () {
  registerKeypress('esc', hideAllMenus)
})
