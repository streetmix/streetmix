/**
 * Determine if any of the menus are currently visible.
 * Returns a boolean value.
 */
export function isAnyMenuVisible () {
  const els = document.querySelectorAll('.menu.visible')
  return !(els.length === 0)
}

/**
 * Hides all menus.
 * Menu state is controlled via the React component MenusContainer, so for
 * functions outside of React, this function sends an event that the component
 * listens for.
 */
export function hideAllMenus () {
  window.dispatchEvent(new CustomEvent('stmx:hide_menus'))
}
