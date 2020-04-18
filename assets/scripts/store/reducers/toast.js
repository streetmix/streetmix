import { ADD_TOAST, DISMISS_TOAST, DESTROY_TOAST } from '../actions'

const initialState = {
  toasts: []
}

/**
 * Toasts are objects with the following signature.
 *
 * provided by dispatch:
 * method - string (optional) - type of toast, if any. one of 'success', 'warning', or empty
 *              changes appearance, and possibly aria role.
 * component - enum (optional) - special toast that is attached to code.
 *              special toasts wrap toast components, so they can also use their own
 *              text. when calling a component, none of the other properties are required
 * title - string (optional) - a title to display if any
 * message - string (required) - a message to display. required if component is not specified
 * action (label) - string (optional) - a button action label. buttons trigger code so
 *              usually they're only attached through components. but this can override the
 *              label possibly.
 * duration (default: 12000 (ms), forever: 0 ) - number. time to expire if different length
 *              is required. the only time you usually need to change this is to have an
 *              expiration date of forever. this means the only way to remove the toast is
 *              to dismiss it (whether by user interaction or other code)
 *
 * auto generated:
 * timestamp (auto generated at time of execution) - use this as unique id
 *    TODO: collisions on this are possible, but we can ignore that for now
 * dismissed (boolean) - true if user dismissed
 *
 * not properties but states logged by toast container logic ....
 * expired (boolean) - this is not stored in the state because it's not required to render.
 *    expired is just timestamp + duration. (if duration !== 0)
 * done (boolean) - true once expired or dismissed, and has animated out. triggered at end of
 *    animation. this can be cleaned up.
 */

const status = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TOAST: {
      const toasts = [
        ...state.toasts.slice(0),
        {
          method: action.method,
          component: action.component,
          title: action.title,
          message: action.message,
          action: action.action,
          duration: action.duration,
          timestamp: Date.now(),
          dismissed: false
        }
      ]

      return {
        ...state,
        toasts
      }
    }
    case DISMISS_TOAST: {
      const toasts = state.toasts.map((item) => {
        if (item.timestamp !== action.id) {
          // This isn't the item we care about - keep it as-is
          return item
        }

        // Otherwise, this is the one we want - return an updated value
        return {
          ...item,
          dismissed: true
        }
      })

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
