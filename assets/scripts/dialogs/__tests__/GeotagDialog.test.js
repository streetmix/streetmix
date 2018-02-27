/* eslint-env jest */
import React from 'react'
import GeotagDialog from '../GeotagDialog'
import { shallow } from 'enzyme'

// Mock dependencies that could break tests
jest.mock('../../streets/remix', () => {})

describe('GeotagDialog', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(
      <GeotagDialog.WrappedComponent
        street={{}}
        addressInformation={{}}
      />
    )
    expect(wrapper.exists()).toEqual(true)
  })

  it('does not allow a location to be confirmed when geocoded data does not have street data')
  it('allows a location to be confirmed when the current signed-in user is the street owner')
  it('allows a location to be confirmed when the current anonymous user started this street')
  it('does not allow a location to be confirmed when the current signed-in user is not the street owner')
  it('does not allow a location to be confirmed when the current anonymous user is not the street owner and there is already an existing location attached')
  it('allows a location to be confirmed when the current anonymous user is not the street owner but there is no existing location attached')
})
