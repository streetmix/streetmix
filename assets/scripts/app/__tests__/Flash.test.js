/* eslint-env jest */
import React from 'react'
import { renderWithRedux } from '../../../../test/helpers/render'
import Flash from '../Flash'

describe('Flash', () => {
  it('renders', () => {
    const { asFragment } = renderWithRedux(<Flash />)
    expect(asFragment()).toMatchSnapshot()
  })
})
