import { SET_APP_FLAGS } from '../actions'

const initialState = {
  readOnly: false
}

const app = (state = initialState, action) => {
  switch (action.type) {
    case SET_APP_FLAGS:
      const obj = Object.assign({}, state, action)
      delete obj.type // Do not save action type.
      return obj
    default:
      return state
  }
}

export default app
