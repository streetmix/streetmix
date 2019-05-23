/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import KeyboardKey from '../KeyboardKey'

describe('KeyboardKey', () => {
  it('renders a <kbd> element with string child', () => {
    const wrapper = shallow(<KeyboardKey>foo</KeyboardKey>)
    expect(wrapper.props().title).toBeUndefined()
    expect(wrapper.debug()).toMatchSnapshot()
  })

  it('renders a <kbd> element with element child', () => {
    const wrapper = shallow(<KeyboardKey><strong>foo</strong></KeyboardKey>)
    expect(wrapper.props().title).toBeUndefined()
    expect(wrapper.debug()).toMatchSnapshot()
  })

  it('renders a <kbd> element with icon and title', () => {
    const wrapper = shallow(<KeyboardKey icon={{ prefix: 'fas', iconName: 'minus' }}>foo</KeyboardKey>)
    expect(wrapper.find('FontAwesomeIcon').length).toBe(1)
    expect(wrapper.props().title).toBe('foo')
    expect(wrapper.debug()).toMatchSnapshot()
  })
})
