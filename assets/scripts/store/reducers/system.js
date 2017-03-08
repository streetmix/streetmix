import { SET_SYSTEM_FLAGS } from '../actions'

const initialState = {
  touch: false,
  phone: false,
  safari: false,
  windows: false,
  noInternet: false,
  viewportWidth: null,
  viewportHeight: null,
  hiDpi: 1.0,
  cssTransform: false,
  ipAddress: null,
  pageVisibility: false,
  hiddenProperty: false,
  visibilityState: false,
  visibilityChange: false
}

const system = (state = initialState, action) => {
  switch (action.type) {
    case SET_SYSTEM_FLAGS:
      const obj = Object.assign({}, state, action)
      delete obj.type // Do not save action type.
      return obj
    default:
      return state
  }
}

export default system
