/* eslint-env jest */
import React from 'react'
import AboutDialog from '../AboutDialog'
import { shallow } from 'enzyme'

describe('AboutDialog', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<AboutDialog />)
    expect(wrapper.exists()).toEqual(true)
  })
})
