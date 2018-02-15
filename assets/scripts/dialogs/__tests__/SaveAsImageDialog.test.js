/* eslint-env jest */
import React from 'react'
import SaveAsImageDialog from '../SaveAsImageDialog'
import { shallow } from 'enzyme'

// Mock dependencies that could break tests
jest.mock('../../streets/image', () => {
  return {
    getStreetImage: () => {}
  }
})
jest.mock('../../users/settings', () => {})

describe('SaveAsImageDialog', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(
      <SaveAsImageDialog.WrappedComponent
        transparentSky={false}
        segmentNames={false}
        streetName={false}
        street={{}}
      />
    )
    expect(wrapper.exists()).toEqual(true)
  })
})
