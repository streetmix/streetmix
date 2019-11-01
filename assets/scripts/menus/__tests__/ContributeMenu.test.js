/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import ContributeMenu from '../ContributeMenu'

describe('ContributeMenu', () => {
  it('renders', () => {
    const wrapper = renderWithReduxAndIntl(<ContributeMenu />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
