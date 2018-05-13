/* eslint-env jest */
import React from 'react'
import { shallow, mount } from 'enzyme'
import { EmptySegment } from '../EmptySegment'

describe('EmptySegment', () => {
  it('renders without crashing with text', () => {
    const wrapper = shallow(<EmptySegment />)
    expect(wrapper.exists()).toEqual(true)
    expect(wrapper.text()).toEqual('Empty space<MeasurementText />')
  })

  it('is half of remaining street width', () => {
    const wrapper = mount(<EmptySegment occupiedWidth={1} remainingWidth={50} position={'left'} />)
    expect(wrapper.find('div').getDOMNode().style.width).toEqual('300px')
  })

  it('is full street width (on the left) if street is empty', () => {
    const wrapper = mount(<EmptySegment occupiedWidth={0} remainingWidth={50} position={'left'} />)
    expect(wrapper.find('div').getDOMNode().style.width).toEqual('600px')
  })

  it('is not displayed (on the right) if street is empty', () => {
    const wrapper = mount(<EmptySegment occupiedWidth={0} remainingWidth={50} position={'right'} />)
    expect(wrapper.find('div').getDOMNode().style.width).toEqual('0px')
    expect(wrapper.find('div').getDOMNode().style.display).toEqual('none')
  })
})
