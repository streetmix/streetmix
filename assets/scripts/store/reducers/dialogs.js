import { SHOW_DIALOG, CLEAR_DIALOGS } from '../actions'

const initialState = {
  name: null,
  props: {}
}

const dialogs = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_DIALOG:
      return {
        name: action.name,
        props: action.props || {}
      }
    case CLEAR_DIALOGS:
      return initialState
    default:
      return state
  }
}

export default dialogs
