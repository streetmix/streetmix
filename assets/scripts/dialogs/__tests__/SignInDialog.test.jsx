/* eslint-env jest */
import React from 'react'
import { render } from '../../../../test/helpers/render'
import SignInDialog from '../SignInDialog'

describe('SignInDialog', () => {
  it('renders', () => {
    const { asFragment } = render(<SignInDialog />)
    expect(asFragment()).toMatchSnapshot()
  })
})
