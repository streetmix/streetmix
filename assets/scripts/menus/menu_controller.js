import store from '../store'
import { clearMenus } from '../store/actions/menus'

/**
 * Determine if any of the menus are currently visible.
 * Returns a boolean value.
 */
export function isAnyMenuVisible () {
  const activeMenu = store.getState().menus.activeMenu
  return Boolean(activeMenu)
}

/**
 * Hides all menus by dispatching a CLEAR_MENUS action to Redux store.
 */
export function hideAllMenus () {
  store.dispatch(clearMenus())
}
