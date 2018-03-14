/* eslint-env jest */
import React from 'react'
import { MenuBarItem } from '../MenuBarItem'
import { shallow } from 'enzyme'

describe('MenuBarItem', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<MenuBarItem />)
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
})
