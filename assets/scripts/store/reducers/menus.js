import {
  SHOW_MENU,
  CLEAR_MENUS,
  SHOW_GALLERY,
  START_PRINTING
} from '../actions'
import { showDialog } from '../slices/dialogs'

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
    case showDialog.type: // Whenever a dialog is shown, also hide menus.
    case START_PRINTING: // Whenever in print mode, also hide menus.
      return initialState
    default:
      return state
  }
}

export default menus
