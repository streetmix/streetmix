/* eslint-env jest */
import React from 'react'
import { render } from '../../../../test/helpers/render'
import Flash from '../Flash'

describe('Flash', () => {
  it('renders', () => {
    const { asFragment } = render(<Flash />)
    expect(asFragment()).toMatchSnapshot()
  })
})
