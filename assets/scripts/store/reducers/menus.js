import {
  SHOW_MENU,
  CLEAR_MENUS,
  SHOW_GALLERY,
  SHOW_DIALOG,
  START_PRINTING
} from '../actions'

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
    case SHOW_GALLERY: // Whenever gallery is shown, hide menus.
    case SHOW_DIALOG: // Whenever a dialog is shown, also hide menus.
    case START_PRINTING: // Whenever in print mode, also hide menus.
      return initialState
    default:
      return state
  }
}

export default menus
