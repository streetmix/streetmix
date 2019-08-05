// Initiate Redux store
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

// This is where other Redux-related libs are added, e.g.
// react-router-redux if we use it in the future.

// Import the root reducer
import reducers from './reducers'

// For Redux devtools extension.
// https://github.com/zalmoxisus/redux-devtools-extension
// const devtools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)))

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
