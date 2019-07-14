import { createStore as createReduxStore, applyMiddleware } from 'redux'
import reducers from '../../assets/scripts/store/reducers'
import thunk from 'redux-thunk'

export const createStore = (initialState = {}) => {
  return createReduxStore(reducers, initialState, applyMiddleware(thunk))
}
