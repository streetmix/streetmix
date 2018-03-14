/* eslint-env jest */
import React from 'react'
import { MenuBarItem } from '../MenuBarItem'
import { shallow } from 'enzyme'

function FormattedMessage () {
  return <span />
}

describe('MenuBarItem', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<MenuBarItem translation="foo" label="foo" />)
    // expect(wrapper.find(FormattedMessage).exists()).toEqual(true)
    expect(wrapper.find('div').length).toEqual(1)
  })

  it('handles the click', () => {
    const showDialog = jest.fn()
    const wrapper = shallow(<MenuBarItem handleClick={showDialog} />)
    wrapper.find('button').simulate('click')
    expect(showDialog).toBeCalled()
  })

  it('does not render if it requires Internet access, and there is no Internet', () => {
    const wrapper = shallow(<MenuBarItem requireInternet />)
    expect(wrapper.find('div').length).toEqual(1)
  })

  it('renders children instead of default label if provided', () => {
    const wrapper = shallow(<MenuBarItem><span className="foo">bar</span></MenuBarItem>)
    expect(wrapper.find(FormattedMessage).exists()).toEqual(false)
    expect(wrapper.find('.foo').exists()).toEqual(true)
    expect(wrapper.text()).toEqual('bar')
  })

  it('renders anchor tag instead of button if url is provided', () => {
    const wrapper = shallow(<MenuBarItem url="#" />)
    expect(wrapper.find('a').exists()).toEqual(true)
  })

  it('passes unhandled props to child elements', () => {
    const wrapper = shallow(<MenuBarItem className="foo" />)
    expect(wrapper.find('.foo').exists()).toEqual(true)
  })
})
