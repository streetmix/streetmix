import { SHOW_MENU, CLEAR_MENUS, SHOW_DIALOG } from '../actions'

const initialState = {
  activeMenu: null
}

const menus = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_MENU:
      return {
        activeMenu: action.name
      }
    case CLEAR_MENUS:
    case SHOW_DIALOG: // Whenever a dialog is shown, also hide menus.
      return initialState
    default:
      return state
  }
}

export default menus
