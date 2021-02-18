import React from 'react'
import { render } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { DndProvider } from 'react-dnd'
import { TestBackend } from 'react-dnd-test-backend'
import { createStore } from './store'

// Define a wrapper component that includes all of our global context
// providers from Redux, react-intl, react-dnd. The nesting order of these
// components should match the actual order in the application.
/* eslint-disable react/prop-types */
const AllTheProviders = ({ store = {}, children }) => {
  return (
    <Provider store={store}>
      <IntlProvider locale="en">
        <DndProvider backend={TestBackend}>{children}</DndProvider>
      </IntlProvider>
    </Provider>
  )
}

// Define a custom render method which wraps our UI elements with the global
// context providers, defined above as `AllTheProviders`. For more information:
// https://testing-library.com/docs/react-testing-library/setup#custom-render
//
// We adopt a pattern to pass props to the wrapper, as described here:
// https://github.com/testing-library/react-testing-library/issues/780
export const renderWithProviders = (ui, options = {}) => {
  const {
    initialState,
    store = createStore(initialState),
    ...restOpts
  } = options
  const wrapper = (props) => <AllTheProviders {...props} store={store} />
  return {
    ...render(ui, { wrapper, ...restOpts }),
    store
  }
}

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

// Re-export everything
// This is a pattern suggested by React Testing Library (see
// https://testing-library.com/docs/react-testing-library/setup/)
// so you can import the render and all other methods from just one
// helper module (this one!)
export * from '@testing-library/react'

// Override render method so that test syntax can remain simple
export { renderWithProviders as render }
