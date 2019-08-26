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

  it.todo('renders a list of flags and values from state')
  it.todo('renders a disabled flag')
  it.todo('renders a flag whose value differs from the default value')
  it.todo('sets a feature flag when the checkbox is clicked')
  it.todo('sets a feature flag when the label is clicked')
  it.todo('closes the dialog when "Close" button is clicked')
})
