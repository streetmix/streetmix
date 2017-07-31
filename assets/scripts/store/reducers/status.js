import {
  SHOW_STATUS_MESSAGE,
  HIDE_STATUS_MESSAGE,
  SHOW_NO_CONNECTION_MESSAGE
} from '../actions'

const initialState = {
  // For normal status message, there is a text message and
  // possibly an undo button
  message: null,
  undoButton: false,
  signInButton: false,
  showMessage: false,

  // A second type of status message exists for when there is
  // no connection to Internet. This is a visibility toggle.
  // It does not reflect actual connectivity.
  noConnectionMessage: false
}

const status = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_STATUS_MESSAGE:
      return {
        ...state,
        message: action.message,
        undoButton: action.undo,
        signInButton: action.signIn,
        showMessage: true
      }
    case HIDE_STATUS_MESSAGE:
      return {
        ...state,
        showMessage: false
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
