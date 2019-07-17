/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import Flash from '../Flash'

describe('Flash', () => {
  it('renders', () => {
    const wrapper = shallow(<Flash />)
    expect(wrapper).toMatchSnapshot()
  })
})
