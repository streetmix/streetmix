import React from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { render } from 'react-testing-library'
import reducers from '../../assets/scripts/store/reducers'

export const renderWithRedux = function (ui,
  { initialState, store = createStore(reducers, initialState) } = {}) {
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store
  }
}
