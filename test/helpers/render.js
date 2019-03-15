import React from 'react'
import {Provider, connect} from 'react-redux'
import {createStore} from 'redux'
import {render } from 'react-testing-library'
import reducers from '../../assets/scripts/store/reducers'

export const renderWithRedux = function( ui,
  {initialState, store = createStore(reducers, initialState)} = {}) {
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    // adding `store` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    store,
  }
}
