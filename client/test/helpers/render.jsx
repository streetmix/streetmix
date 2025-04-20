import React from 'react'
import { render as originalRender } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { DndProvider } from 'react-dnd'
import { TestBackend } from 'react-dnd-test-backend'
import { createStore } from './store'

// Define a wrapper component that includes all of our global context
// providers from Redux, react-intl, react-dnd. The nesting order of these
// components should match the actual order in the application.
// Yes, this means that some wrapped components have more context than is
// strictly necessary, but this is easier on the developer, as they don't
// need to be aware of which contexts are required by the component or
// by child components as well.
// In practice, this has only a small impact on testing time, as well.
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
export const render = (ui, options = {}) => {
  const {
    initialState,
    store = createStore(initialState),
    ...restOpts
  } = options
  const wrapper = (props) => <AllTheProviders {...props} store={store} />
  return {
    ...originalRender(ui, { wrapper, ...restOpts }),
    store
  }
}

// NOTE: The exports below are broken in Vitest v3+
// For some reason, export * will overwrite the custom render function
// written above. Since only one test suite actually made use of the
// re-exported functionality, I updated that rather than rename the
// custom render function in order to apply this across all the other
// test suites.

// Re-export everything
// This is a pattern suggested by React Testing Library (see
// https://testing-library.com/docs/react-testing-library/setup/)
// so you can import the render and all other methods from just one
// helper module (this one!)
// eslint-disable-next-line import/export
// export * from '@testing-library/react'

// Override render method so that test syntax can remain simple
// eslint-disable-next-line import/export
// export { renderWithProviders as render }
