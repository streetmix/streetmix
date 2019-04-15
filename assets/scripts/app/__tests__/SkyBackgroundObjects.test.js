/* eslint-env jest */
import React from 'react'
import { SkyBackgroundObjects } from '../SkyBackgroundObjects'
import { mount } from 'enzyme'

describe('SkyBackgroundObjects', () => {
  it('renders', () => {
    const wrapper = mount(<SkyBackgroundObjects environment="foo" />)
    expect(wrapper).toMatchSnapshot()
  })
})
