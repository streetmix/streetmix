import { configureStore } from '@reduxjs/toolkit'
import reducers from '../../store/reducers'
import { streetmixApi } from '../../store/services/api'

export function createStore (initialState = {}) {
  return configureStore({
    reducer: {
      ...reducers,
      [streetmixApi.reducerPath]: streetmixApi.reducer
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(streetmixApi.middleware)
  })
}
