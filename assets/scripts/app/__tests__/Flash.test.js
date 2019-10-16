/* eslint-env jest */
import React from 'react'
import { renderWithRedux } from '../../../../test/helpers/render'
import Flash from '../Flash'

describe('Flash', () => {
  it('renders', () => {
    const wrapper = renderWithRedux(<Flash />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
