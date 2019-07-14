/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ContactMenu } from '../ContactMenu'

describe('ContactMenu', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<ContactMenu />)
    expect(wrapper.exists()).toEqual(true)
  })
})
