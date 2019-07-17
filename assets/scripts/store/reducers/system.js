/* global Modernizr */
import { SET_SYSTEM_FLAGS, UPDATE_WINDOW_SIZE } from '../actions'

const initialState = {
  touch: (Modernizr && Modernizr.touchevents) || false,
  // "Phone" detection is based on "max screen size"
  phone: ((typeof window.matchMedia !== 'undefined') &&
    (window.matchMedia('only screen and (max-device-width: 480px)').matches ||
    window.matchMedia('only screen and (max-device-height: 480px)').matches)) || false,
  safari: ((navigator.userAgent.indexOf('Safari') !== -1) && (navigator.userAgent.indexOf('Chrome') === -1)) || false,
  windows: (navigator.userAgent.indexOf('Windows') !== -1) || false,
  noInternet: false,
  viewportWidth: window.innerWidth,
  viewportHeight: window.innerHeight,
  devicePixelRatio: window.devicePixelRatio || 1.0
}

const system = (state = initialState, action) => {
  switch (action.type) {
    case SET_SYSTEM_FLAGS:
      const obj = Object.assign({}, state, action)
      delete obj.type // Do not save action type.
      return obj
    case UPDATE_WINDOW_SIZE:
      return {
        ...state,
        viewportWidth: action.viewportWidth,
        viewportHeight: action.viewportHeight
      }
    default:
      return state
  }
}

export default system
