import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { ToastItem } from '../../types'

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

const initialState: ToastItem[] = []

const toastsSlice = createSlice({
  name: 'toasts',
  initialState,

  reducers: {
    addToast: {
      reducer (state, action: PayloadAction<ToastItem>) {
        state.push(action.payload)
      },
      prepare (toast: Omit<ToastItem, 'timestamp'>) {
        return {
          payload: {
            ...toast,
            // The timestamp is used to identify when a toast is generated,
            // and currently does double duty as a unique identifier. This
            // must be done here (in an action creator prepare()) as opposed
            // to the reducer because this is *not* a pure function.
            timestamp: Date.now()
          }
        }
      }
    },

    destroyToast (state, action: PayloadAction<ToastItem['timestamp']>) {
      return state.filter((item) => item.timestamp !== action.payload)
    }
  }
})

export const { addToast, destroyToast } = toastsSlice.actions

export default toastsSlice.reducer
