import React from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { render } from '@testing-library/react'
import { createStore } from './store'

export const renderWithRedux = function (
  ui,
  { initialState, store = createStore(initialState) } = {}
) {
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store
  }
}

export const renderWithIntl = function (ui) {
  return {
    ...render(<IntlProvider locale="en">{ui}</IntlProvider>)
  }
}

export const renderWithReduxAndIntl = function (
  ui,
  { initialState, store = createStore(initialState) } = {}
) {
  return {
    ...render(
      <Provider store={store}>
        <IntlProvider locale="en">{ui}</IntlProvider>
      </Provider>
    ),
    store
  }
}
