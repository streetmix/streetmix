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
import { configureStore, type Unsubscribe } from '@reduxjs/toolkit'
import reducers from './reducers'
import { streetmixApi } from './services/api'

const store = configureStore({
  reducer: {
    ...reducers,
    [streetmixApi.reducerPath]: streetmixApi.reducer
  },
  // Disable these checks in development mode, as they can be performance-
  // heavy and create a lot warning spam in console. See this issue for info:
  // https://github.com/reduxjs/redux-toolkit/issues/415
  // Yes, this means the checks don't run at all. They can be helpful when
  // writing new reducers, or refactoring them, so it's fine to temporarily
  // re-enable them when you need them. Otherwise, leave it false so that
  // the development experience isn't unnecessarily crippled.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false
    }).concat(streetmixApi.middleware)
})

export default store

// Export types
// https://redux.js.org/usage/usage-with-typescript#define-root-state-and-dispatch-types
export type RootState = ReturnType<typeof store.getState>
export type Dispatch = typeof store.dispatch

// https://redux.js.org/docs/api/Store.html#subscribelistener
// https://github.com/reactjs/redux/issues/303#issuecomment-125184409
// It differs from above in the sense that it assumes the store from this module
// and it does _not_ call handleChange() immediately upon invocation
// (where it is guaranteed to execute because it has not cached previous state)
export function observeStore<T> (
  select: (state: RootState) => T,
  onChange: (selected: T) => void
): Unsubscribe {
  let currentState: T | undefined

  function handleChange (): void {
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
