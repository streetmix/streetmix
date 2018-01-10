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
