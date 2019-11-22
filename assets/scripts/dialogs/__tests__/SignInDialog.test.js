/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import SignInDialog from '../SignInDialog'

describe('SignInDialog', () => {
  it('renders', () => {
    const wrapper = renderWithReduxAndIntl(<SignInDialog />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
