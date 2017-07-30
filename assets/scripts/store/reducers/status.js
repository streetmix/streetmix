import { SET_STATUS_MESSAGE, SHOW_NO_CONNECTION_MESSAGE } from '../actions'

const initialState = {
  message: null,
  noConnectionMessage: false
}

const status = (state = initialState, action) => {
  switch (action.type) {
    case SET_STATUS_MESSAGE:
      return {
        ...state,
        message: action.message
      }
    case SHOW_NO_CONNECTION_MESSAGE:
      return {
        ...state,
        noConnectionMessage: action.noConnectionMessage
      }
    default:
      return state
  }
}

export default status
