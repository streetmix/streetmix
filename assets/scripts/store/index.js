// Initiate Redux store
import { createStore } from 'redux'

// This is where other Redux-related libs are added, e.g.
// react-router-redux if we use it in the future.

// Import the root reducer
import reducers from './reducers'

// For Redux devtools extension.
// https://github.com/zalmoxisus/redux-devtools-extension
const devtools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
const store = createStore(reducers, devtools)

export default store
