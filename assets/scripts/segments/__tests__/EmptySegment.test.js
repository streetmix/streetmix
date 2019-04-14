/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { mountWithIntl } from '../../../../test/helpers/intl-enzyme-test-helper.js'
import { EmptySegment } from '../EmptySegment'
import { TILE_SIZE } from '../../segments/constants'
import { SETTINGS_UNITS_METRIC, SETTINGS_UNITS_IMPERIAL } from '../../users/constants'

describe('EmptySegment', () => {
  it('renders nothing when the width is 0', () => {
    const wrapper = shallow(<EmptySegment width={0} />)
    expect(wrapper.html()).toEqual(null)
  })

  it('renders a width, and at left position 0 by default', () => {
    const wrapper = shallow(<EmptySegment width={12.5} units={SETTINGS_UNITS_METRIC} locale="en" />)
    expect(wrapper.find('.segment-empty').props().style.width).toEqual(`${12.5 * TILE_SIZE}px`)
    expect(wrapper.find('.segment-empty').props().style.left).toEqual('0px')
  })

  it('renders at width and left position given', () => {
    const wrapper = shallow(<EmptySegment width={15} left={33} units={SETTINGS_UNITS_METRIC} locale="en" />)
    expect(wrapper.find('.segment-empty').props().style.width).toEqual(`${15 * TILE_SIZE}px`)
    expect(wrapper.find('.segment-empty').props().style.left).toEqual(`${33 * TILE_SIZE}px`)
  })

  it('renders correct grid styling in metric', () => {
    const wrapper = shallow(<EmptySegment width={1} units={SETTINGS_UNITS_METRIC} locale="en" />)
    expect(wrapper.find('.units-metric').length).toEqual(1)
  })

  it('renders correct grid styling in imperial', () => {
    const wrapper = shallow(<EmptySegment width={1} units={SETTINGS_UNITS_IMPERIAL} locale="en" />)
    expect(wrapper.find('.units-imperial').length).toEqual(1)
  })

  // TODO: unskip these tests when enzyme and react-test-render support memoized components
  it.skip('renders text content', () => {
    const wrapper = mountWithIntl(<EmptySegment width={15} units={SETTINGS_UNITS_METRIC} locale="en" />)
    expect(wrapper.text()).toEqual('Empty space4.5 m')
  })
})
