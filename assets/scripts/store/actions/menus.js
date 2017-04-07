import { SHOW_MENU, CLEAR_MENUS } from './index'

export function showMenu (name) {
  return {
    type: SHOW_MENU,
    name
  }
}

export function clearMenus () {
  return {
    type: CLEAR_MENUS
  }
}
