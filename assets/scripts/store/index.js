/**
 * Initiates Redux store.
 *
 * Redux Toolkit is a framework on top of Redux that provides common middleware
 * and helps enforce best practices by default. We're outsourcing opinions
 * to the Redux ecosystem, which saves us time and reduces our need to write
 * excess boilerplate Redux code by hand.
 *
 * The @reduxjs/toolkit package automatically installs `redux` and
 * `redux-thunk`. In development environments, it will also automatically
 * enable the Redux DevTools extension, and install middleware to check for
 * immutability violations and non-serializable data.
 *
 * To help with not mutating data by accident, reducers created by either
 * `createSlice` or `createReducer` will be wrapped with `produce` from the
 * `immer` library, which allows us to write code that appears to mutate
 * state, and will instead return the correct immutable result. This is magic!
 * It's important to remember that magic is happening!
 *
 * For more info: https://redux-toolkit.js.org/
 *
 */
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import reducers from './reducers'

const store = configureStore({
  reducer: reducers,
  middleware: [
    ...getDefaultMiddleware({
      immutableCheck: {
        // Immutability violations that are difficult to fix right now.
        ignoredPaths: ['street']
      }
    })
  ]
})

export default store

// https://redux.js.org/docs/api/Store.html#subscribelistener
// https://github.com/reactjs/redux/issues/303#issuecomment-125184409
// It differs from above in the sense that it assumes the store from this module
// and it does _not_ call handleChange() immediately upon invocation
// (where it is guaranteed to execute because it has not cached previous state)
export function observeStore (select, onChange) {
  let currentState

  function handleChange () {
    const nextState = select(store.getState())
    if (nextState !== currentState) {
      currentState = nextState
      onChange(currentState)
    }
  }

  const unsubscribe = store.subscribe(handleChange)
  // handleChange()
  return unsubscribe
}
