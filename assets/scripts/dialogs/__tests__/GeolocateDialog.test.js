/* eslint-env jest */
import React from 'react'
import GeolocateDialog from '../GeolocateDialog'
import { shallow } from 'enzyme'

// Mock dependencies that could break tests
jest.mock('../../streets/remix', () => {})

describe('GeolocateDialog', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(
      <GeolocateDialog.WrappedComponent
        street={{}}
        addressInformation={{}}
      />
    )
    expect(wrapper.exists()).toEqual(true)
  })
})
