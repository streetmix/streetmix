import React from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { render } from 'react-testing-library'
import reducers from '../../assets/scripts/store/reducers'
import thunk from 'redux-thunk'
import { IntlProvider } from 'react-intl'

// use mock store

export const renderWithRedux = function (ui,
  { initialState, store = createStore(reducers, initialState, applyMiddleware(thunk)) } = {}) {
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store
  }
}

export const renderWithReduxAndIntl = function (ui,
  { initialState, store = createStore(reducers, initialState, applyMiddleware(thunk)) } = {}) {
  return {
    ...render(<Provider store={store}><IntlProvider locale="en">{ui}</IntlProvider></Provider>),
    store
  }
}
