/* eslint-env jest */
import React from 'react'
import { cleanup, fireEvent } from '@testing-library/react'
import { renderWithRedux } from '../../../../test/helpers/render'
import DebugInfo from '../DebugInfo'

describe('DebugInfo', () => {
  const initialState = {
    settings: {},
    street: {},
    flags: {},
    undo: {},
    user: {}
  }

  it('renders', () => {
    const wrapper = renderWithRedux(<DebugInfo />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  // fireEvent isn't working.
  it.skip('is visible when opened with keyboard shortcut', () => {
    const wrapper = renderWithRedux(<DebugInfo />, { initialState })
    fireEvent.keyDown(window, { key: 'D', code: 68, shiftKey: true })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
