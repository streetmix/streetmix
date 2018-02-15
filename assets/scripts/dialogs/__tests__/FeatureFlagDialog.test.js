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
        clearDialogs={jest.fn()}
        flags={{}}
      />
    )
    expect(wrapper.exists()).toEqual(true)
  })
})
