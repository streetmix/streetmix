/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import MenuBarItem from '../MenuBarItem'

function FormattedMessage () {
  return <span />
}

describe('MenuBarItem', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<MenuBarItem label="foo" translation="foo" />)
    expect(wrapper.children().length).toEqual(1)
  })

  it('handles the click on a button', () => {
    const handleClick = jest.fn()
    const wrapper = shallow(<MenuBarItem onClick={handleClick} />)
    wrapper.find('button').simulate('click')
    expect(handleClick).toBeCalled()
  })

  it('handles the click on a link', () => {
    const handleClick = jest.fn()
    const wrapper = shallow(<MenuBarItem url="#" onClick={handleClick} />)
    wrapper.find('a').simulate('click')
    expect(handleClick).toBeCalled()
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
