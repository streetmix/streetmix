/* eslint-env jest */
import React from 'react'
import Triangle from '../Triangle'
import { shallow } from 'enzyme'

describe('Triangle', () => {
  it('renders an unhighlighted triangle by default', () => {
    const wrapper = shallow(<Triangle />)
    expect(wrapper.find('div').hasClass('info-bubble-triangle-highlight')).toEqual(false)
  })

  it('renders an highlighted triangle', () => {
    const wrapper = shallow(<Triangle highlight />)
    expect(wrapper.find('div').hasClass('info-bubble-triangle-highlight')).toEqual(true)
  })

  it('renders an unhighlighted triangle', () => {
    const wrapper = shallow(<Triangle highlight={false} />)
    expect(wrapper.find('div').hasClass('info-bubble-triangle-highlight')).toEqual(false)
  })
})
