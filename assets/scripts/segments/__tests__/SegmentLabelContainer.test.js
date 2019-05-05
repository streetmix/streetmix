/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import SegmentLabelContainer from '../SegmentLabelContainer'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../../users/constants'

const testProps = {
  label: 'foo',
  width: 1,
  units: SETTINGS_UNITS_METRIC,
  locale: 'en'
}

describe('SegmentLabelContainer', () => {
  it('renders string label', () => {
    const wrapper = shallow(<SegmentLabelContainer {...testProps} label="bar" />)
    expect(wrapper).toMatchSnapshot()
  })

  it('renders React element label', () => {
    const TestComponent = <span>bar</span>
    const wrapper = shallow(<SegmentLabelContainer {...testProps} label={TestComponent} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('renders correct grid styling in metric', () => {
    const wrapper = shallow(<SegmentLabelContainer {...testProps} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('renders correct grid styling in imperial', () => {
    const wrapper = shallow(<SegmentLabelContainer {...testProps} units={SETTINGS_UNITS_IMPERIAL} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('renders editable label', () => {
    const wrapper = shallow(<SegmentLabelContainer {...testProps} editable editSegmentLabel={() => {}} />)
    expect(wrapper).toMatchSnapshot()
  })
})
