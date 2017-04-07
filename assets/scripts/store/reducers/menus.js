import { SHOW_MENU, CLEAR_MENUS } from '../actions'

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
      return initialState
    default:
      return state
  }
}

export default menus
