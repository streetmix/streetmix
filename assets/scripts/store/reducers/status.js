import { SHOW_NO_CONNECTION_MESSAGE } from '../actions'

const initialState = {
  // A second type of status message exists for when there is
  // no connection to Internet. This is a visibility toggle.
  // It does not reflect actual connectivity.
  noConnectionMessage: false
}

const status = (state = initialState, action) => {
  switch (action.type) {
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
