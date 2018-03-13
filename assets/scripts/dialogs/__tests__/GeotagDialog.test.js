/* eslint-env jest */
import React from 'react'
import GeotagDialog from '../GeotagDialog'
import { shallow } from 'enzyme'

// Mock dependencies that could break tests
jest.mock('../../streets/remix', () => {
  return {
    getRemixOnFirstEdit: () => {
      return false
    }
  }
})

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

  it('does not allow a location to be confirmed when geocoded data does not have street data', () => {
    const testMarker = { lat: 0, lng: 0 }
    const testAddressInfo = {
      street: null
    }
    const wrapper = shallow(
      <GeotagDialog.WrappedComponent
        street={{}}
        addressInformation={testAddressInfo}
        markerLocation={testMarker}
      />
    )
    expect(wrapper.find('button .confirm-button').length).toEqual(0)
  })
  // Current signed-in or not signed-in user compared to street owner is based on getRemixOnFirstEdit
  // which uses store.user.signedInData. Not sure how to replicate that in testing environment.
  it('allows a location to be confirmed when the current signed-in user is the street owner', () => {
    // getRemixOnFirstEdit returns false - meaning the current signed-in user is the street owner
    // getRemixOnFirstEdit returns true - current signed-user or not signed in is not the street owner
    const testMarker = { lat: 0, lng: 0 }
    const testAddressInfo = {
      street: 'test street',
      id: 'test id'
    }
    const testStreet = {
      creatorId: 'test creator',
      location: {
        label: 'test location',
        wofId: 'test id'
      }
    }
    const wrapper = shallow(
      <GeotagDialog.WrappedComponent
        street={testStreet}
        addressInformation={testAddressInfo}
        markerLocation={testMarker}
      />
    )
    wrapper.setProps({
      markerLocation: { lat: 10, lng: 10 },
      addressInformation: {
        street: 'test street 2',
        id: 'test id 2'
      }
    })
    expect(wrapper.find('button .confirm-button').length).toEqual(1)
  })
  it('allows a location to be confirmed when the current anonymous user started this street')
  it('does not allow a location to be confirmed when the current signed-in user is not the street owner')
  it('does not allow a location to be confirmed when the current anonymous user is not the street owner and there is already an existing location attached')
  it('allows a location to be confirmed when the current anonymous user is not the street owner but there is no existing location attached')
})
