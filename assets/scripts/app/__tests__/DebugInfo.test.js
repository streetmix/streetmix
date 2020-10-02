/* eslint-env jest */
import React from 'react'
import userEvent from '@testing-library/user-event'
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

  it('renders nothing by default', () => {
    const { container } = renderWithRedux(<DebugInfo />, { initialState })
    expect(container).toBeEmptyDOMElement()
  })

  it('is visible when opened with keyboard shortcut', () => {
    const { container, asFragment } = renderWithRedux(<DebugInfo />, {
      initialState
    })
    userEvent.type(container, '{shift}D')
    expect(asFragment()).toMatchSnapshot()
  })
})
