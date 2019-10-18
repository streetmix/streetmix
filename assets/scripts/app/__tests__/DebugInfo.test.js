/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
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

  it('is visible when opened with keyboard shortcut', () => {
    const wrapper = renderWithRedux(<DebugInfo />, { initialState })
    fireEvent.keyDown(window, {
      key: 'D',
      code: 'KeyD',
      keyCode: 68,
      shiftKey: true
    })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
