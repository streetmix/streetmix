/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import Warnings from '../Warnings'

describe('Warnings', () => {
  it('renders nothing if segment has no warnings', () => {
    const segment = {}
    const wrapper = shallow(<Warnings segment={segment} />)
    expect(wrapper.children().length).toBe(0)
  })

  // Note: warnings start indexing at 1!

  it('renders warning 1', () => {
    const segment = {
      warnings: [ null, true ]
    }
    const wrapper = shallow(<Warnings segment={segment} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('renders warning 2', () => {
    const segment = {
      warnings: [ null, false, true, false ]
    }
    const wrapper = shallow(<Warnings segment={segment} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('renders warning 3', () => {
    const segment = {
      warnings: [ null, false, false, true ]
    }
    const wrapper = shallow(<Warnings segment={segment} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('renders two warnings', () => {
    const segment = {
      warnings: [ null, true, false, true ]
    }
    const wrapper = shallow(<Warnings segment={segment} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('renders three warnings', () => {
    const segment = {
      warnings: [ null, true, true, true ]
    }
    const wrapper = shallow(<Warnings segment={segment} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('renders no warnings', () => {
    const segment = {
      warnings: [ null, false, false, false ]
    }
    const wrapper = shallow(<Warnings segment={segment} />)
    expect(wrapper).toMatchSnapshot()
  })
})
