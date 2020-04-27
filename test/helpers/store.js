import { configureStore } from '@reduxjs/toolkit'
import reducers from '../../assets/scripts/store/reducers'

export function createStore (initialState = {}) {
  return configureStore({
    reducer: reducers,
    preloadedState: initialState
  })
}
