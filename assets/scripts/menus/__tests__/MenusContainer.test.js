/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import MenusContainer from '../MenusContainer'

describe('MenusContainer', () => {
  // Menu container should be empty at mount
  // It will only render a menu when one is active
  it('renders', () => {
    const { asFragment } = renderWithReduxAndIntl(<MenusContainer />)
    expect(asFragment()).toMatchSnapshot()
  })
})
