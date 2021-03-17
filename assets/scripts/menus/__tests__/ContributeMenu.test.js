/* eslint-env jest */
import React from 'react'
import { render } from '../../../../test/helpers/render'
import ContributeMenu from '../ContributeMenu'

describe('ContributeMenu', () => {
  it('renders', () => {
    const { asFragment } = render(<ContributeMenu isActive={true} />)
    expect(asFragment()).toMatchSnapshot()
  })
})
