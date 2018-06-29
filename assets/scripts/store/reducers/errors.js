import {
  SHOW_ERROR,
  HIDE_ERROR
} from '../actions'

const initialState = {
  errorType: null,
  abortEverything: false
}

const status = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_ERROR:
      return {
        ...state,
        errorType: action.errorType,
        abortEverything: action.abortEverything
      }
    case HIDE_ERROR:
      return initialState
    default:
      return state
  }
}

export default status
