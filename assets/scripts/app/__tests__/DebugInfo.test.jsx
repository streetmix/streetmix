/* eslint-env jest */
import React from 'react'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
import DebugInfo from '../DebugInfo'

describe('DebugInfo', () => {
  const initialState = {
    settings: {},
    street: {},
    flags: {},
    history: {},
    user: {}
  }

  it('renders nothing by default', () => {
    const { container } = render(<DebugInfo />, { initialState })
    expect(container).toBeEmptyDOMElement()
  })

  it('is visible when opened with keyboard shortcut', async () => {
    const { container, asFragment } = render(<DebugInfo />, {
      initialState
    })
    await userEvent.type(container, '{shift}D')
    expect(asFragment()).toMatchSnapshot()
  })
})
