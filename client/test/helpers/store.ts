import { configureStore } from '@reduxjs/toolkit'

import reducers from '~/src/store/reducers'
import { streetmixApi } from '~/src/store/services/api'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
