/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import ContributeMenu from '../ContributeMenu'

describe('ContributeMenu', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<ContributeMenu />)
    expect(wrapper.exists()).toEqual(true)
  })
})
