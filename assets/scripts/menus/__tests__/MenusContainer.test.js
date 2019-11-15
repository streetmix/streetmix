/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import MenusContainer from '../MenusContainer'

describe('MenusContainer', () => {
  it('renders', () => {
    const wrapper = renderWithReduxAndIntl(<MenusContainer />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
