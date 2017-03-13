import { SET_USER_SIGN_IN_DATA } from '../actions'

const initialState = {
  signInData: null,
  signedIn: false,
  signInLoaded: false
}

const settings = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_SIGN_IN_DATA:
      return {
        ...state,
        signInData: action.signInData
      }
    default:
      return state
  }
}

export default settings
