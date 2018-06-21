/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { EmptySegmentContainer } from '../EmptySegmentContainer'
import EmptySegment from '../EmptySegment'

describe('EmptySegment', () => {
  it('renders two <EmptySegment /> components of equal width', () => {
    const wrapper = shallow(<EmptySegmentContainer remainingWidth={10} occupiedWidth={40} />)

    expect(wrapper.find(EmptySegment).length).toEqual(2)
    expect(wrapper.find(EmptySegment).at(0).props()).toMatchObject({ width: 5, left: 0 })
    expect(wrapper.find(EmptySegment).at(1).props()).toMatchObject({ width: 5, left: 45 })
  })

  it('renders one <EmptySegment /> component if street is totally empty', () => {
    const wrapper = shallow(<EmptySegmentContainer remainingWidth={50} occupiedWidth={0} />)
    expect(wrapper.find(EmptySegment).length).toEqual(1)
    expect(wrapper.find(EmptySegment).at(0).props()).toMatchObject({ width: 50 })
  })

  it('renders zero <EmptySegment /> components if street is fully occupied', () => {
    const wrapper = shallow(<EmptySegmentContainer remainingWidth={0} occupiedWidth={50} />)
    expect(wrapper.find(EmptySegment).length).toEqual(0)
  })

  it('renders zero <EmptySegment /> components if street is over occupied', () => {
    const wrapper = shallow(<EmptySegmentContainer remainingWidth={-10} occupiedWidth={50} />)
    expect(wrapper.find(EmptySegment).length).toEqual(0)
  })
})
