import { ADD_TOAST, DESTROY_TOAST } from '../actions'

const initialState = {
  toasts: []
}

/**
 * Toasts are objects with the following signature.
 *
 * provided by dispatch:
 * mode - string (optional) - type of toast, if any. one of 'success', 'warning', or empty
 *              changes appearance, and possibly aria role.
 * component - enum (optional) - special toast that is attached to code.
 *              special toasts wrap toast components, so they can also use their own
 *              text. when calling a component, none of the other properties are required
 * title - string (optional) - a title to display if any
 * message - string (required) - a message to display. required if component is not specified
 * action (label) - string (optional) - a button action label. buttons trigger code so
 *              usually they're only attached through components. but this can override the
 *              label possibly.
 * duration (default: 6000 (ms), forever: null ) - number. time to expire if different length
 *              is required. if you want it to be on screen indefinitely set duration to
 *              Infinity, so it never expires. this means the only way to remove the toast is
 *              to dismiss it (whether by user interaction or other code)
 *
 * auto generated:
 * timestamp (auto generated at time of execution) - use this as unique id
 *    TODO: collisions on this are possible, but we can ignore that for now
 */

const status = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TOAST: {
      const toasts = [
        ...state.toasts.slice(0),
        {
          mode: action.mode,
          component: action.component,
          title: action.title,
          message: action.message,
          action: action.action,
          duration: action.duration,
          timestamp: Date.now()
        }
      ]

      return {
        ...state,
        toasts
      }
    }
    case DESTROY_TOAST: {
      const toasts = state.toasts.filter((item) => item.timestamp !== action.id)

      return {
        ...state,
        toasts
      }
    }
    default:
      return state
  }
}

export default status
