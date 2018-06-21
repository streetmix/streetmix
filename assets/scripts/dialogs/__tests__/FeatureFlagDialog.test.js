/* eslint-env jest */
import React from 'react'
import FeatureFlagDialog from '../FeatureFlagDialog'
import { shallow } from 'enzyme'

describe('FeatureFlagDialog', () => {
  it('renders without crashing', () => {
    const props = {
      flags: {}
    }
    const wrapper = shallow(
      <FeatureFlagDialog.WrappedComponent
        {...props}
        setFeatureFlag={jest.fn()}
        closeDialog={jest.fn()}
        flags={{}}
      />
    )
    expect(wrapper.exists()).toEqual(true)
  })

  it('renders a list of flags and values from state', () => {})
  it('renders a disabled flag', () => {})
  it('renders a flag whose value differs from the default value', () => {})
  it('sets a feature flag when the checkbox is clicked', () => {})
  it('sets a feature flag when the label is clicked', () => {})
  it('closes the dialog when "Close" button is clicked', () => {})
})
