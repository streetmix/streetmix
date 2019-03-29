/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import MeasurementText from '../MeasurementText'

// TODO: unskip these tests when enzyme and react-test-render support memoized components
describe.skip('MeasurementText', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<MeasurementText />)
    expect(wrapper.exists()).toEqual(true)
  })

  it('displays a value in imperial units', () => {
    const wrapper = shallow(<MeasurementText value={3} units={1} locale="en-US" />)
    expect(wrapper.text()).toEqual("3'")
  })

  it('displays a fractional value in imperial units', () => {
    const wrapper = shallow(<MeasurementText value={3.5} units={1} locale="en-US" />)
    expect(wrapper.text()).toEqual("3½'")
  })

  it('displays a value in metric units', () => {
    const wrapper = shallow(<MeasurementText value={9} units={2} locale="en-US" />)
    expect(wrapper.text()).toEqual('2.7 m')
  })

  // Not working?
  it.skip('displays a value in metric units in French', () => {
    const wrapper = shallow(<MeasurementText value={9} units={2} locale="fr" />)
    expect(wrapper.text()).toEqual('2,7 m')
  })
})
