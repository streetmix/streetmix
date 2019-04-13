/* eslint-env jest */
import React from 'react'
import { SkyBackground } from '../SkyBackground'
import { shallow } from 'enzyme'

describe('SkyBackground', () => {
  it('renders', () => {
    const wrapper = shallow(<SkyBackground environment="foo" scrollPos={0} height={100} />)
    expect(wrapper).toMatchSnapshot()
  })
})
