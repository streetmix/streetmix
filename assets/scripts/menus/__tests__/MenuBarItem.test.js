/* eslint-env jest */
import React from 'react'
import { MenuBarItem } from '../MenuBarItem'
import { shallow } from 'enzyme'

function FormattedMessage () {
  return <span />
}

describe('MenuBarItem', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<MenuBarItem label="foo" translation="foo" />)
    expect(wrapper.children().length).toEqual(1)
  })

  it('handles the click', () => {
    const showDialog = jest.fn()
    const wrapper = shallow(<MenuBarItem handleClick={showDialog} />)
    wrapper.find('button').simulate('click')
    expect(showDialog).toBeCalled()
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

  describe('internet connectivity behavior', () => {
    it('does not render if it requires Internet access, and there is no Internet', () => {
      const wrapper = shallow(<MenuBarItem requireInternet noInternet />)
      expect(wrapper.children().length).toEqual(0)
    })

    it('renders if it requires Internet access, and there is Internet', () => {
      const wrapper = shallow(<MenuBarItem requireInternet noInternet={false} />)
      expect(wrapper.children().length).toEqual(1)
    })

    it('renders if it does not require Internet access, and there is no Internet', () => {
      const wrapper = shallow(<MenuBarItem noInternet />)
      expect(wrapper.children().length).toEqual(1)
    })
  })
})
