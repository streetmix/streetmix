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
      // This action allows setting arbitrary properties directly to the state
      // object. The only property we don't want to copy is `type`, which is
      // only used here to specify the action type. Make sure we combine incoming
      // properties with existing properties.
      const obj = Object.assign({}, state, action)
      delete obj.type
      return obj
    default:
      return state
  }
}

export default system
