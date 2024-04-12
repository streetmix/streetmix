import React from 'react'
import { render } from '../test/helpers/render'
import MenusContainer from './MenusContainer'

describe('MenusContainer', () => {
  // Menu container should be empty at mount
  // It will only render a menu when one is active
  it('renders', () => {
    const { asFragment } = render(<MenusContainer />)
    expect(asFragment()).toMatchSnapshot()
  })
})
