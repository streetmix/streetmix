import { SET_APP_FLAGS, SET_PRINTING } from '../actions'

const initialState = {
  readOnly: false,
  printing: false
}

const app = (state = initialState, action) => {
  switch (action.type) {
    case SET_APP_FLAGS:
      return {
        ...state,
        ...action.flags
      }
    case SET_PRINTING:
      return {
        ...state,
        printing: action.printing
      }
    default:
      return state
  }
}

export default app
