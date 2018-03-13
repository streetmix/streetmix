/* eslint-env jest */
import React from 'react'
import GeotagDialog from '../GeotagDialog'
import { shallow } from 'enzyme'
import { getRemixOnFirstEdit } from '../../streets/remix'

// Mock dependencies that could break tests
jest.mock('../../streets/remix', () => ({
  getRemixOnFirstEdit: jest.fn()
}))

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
    expect(wrapper.find('button .confirm-button')).toHaveLength(0)
  })
  it('allows a location to be confirmed when the current signed-in user is the street owner', () => {
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
    getRemixOnFirstEdit.mockReturnValueOnce(false)
    wrapper.setProps({
      markerLocation: { lat: 10, lng: 10 },
      addressInformation: {
        street: 'test street 2',
        id: 'test id 2'
      }
    })
    expect(wrapper.find('button .confirm-button')).toHaveLength(1)
  })
  it('allows a location to be confirmed when the current anonymous user started this street', () => {
    const testMarker = { lat: 0, lng: 0 }
    const testAddressInfo = {
      street: 'test street',
      id: 'test id'
    }
    const testStreet = {
      creatorId: null,
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
    getRemixOnFirstEdit.mockReturnValueOnce(false)
    wrapper.setProps({
      markerLocation: { lat: 10, lng: 10 },
      addressInformation: {
        street: 'test street 2',
        id: 'test id 2'
      }
    })
    expect(wrapper.find('button .confirm-button')).toHaveLength(1)
  })
  it('does not allow a location to be confirmed when the current signed-in user is not the street owner', () => {
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
    getRemixOnFirstEdit.mockReturnValueOnce(true)
    wrapper.setProps({
      markerLocation: { lat: 10, lng: 10 },
      addressInformation: {
        street: 'test street 2',
        id: 'test id 2'
      }
    })
    expect(wrapper.find('button .confirm-button')).toHaveLength(0)
  })
  it('does not allow a location to be confirmed when the current anonymous user is not the street owner and there is already an existing location attached', () => {
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
    getRemixOnFirstEdit.mockReturnValueOnce(true)
    wrapper.setProps({
      markerLocation: { lat: 10, lng: 10 },
      addressInformation: {
        street: 'test street 2',
        id: 'test id 2'
      }
    })
    expect(wrapper.find('button .confirm-button')).toHaveLength(0)
  })
  it('allows a location to be confirmed when the current anonymous user is not the street owner but there is no existing location attached', () => {
    const testMarker = { lat: 0, lng: 0 }
    const testAddressInfo = {
      street: 'test street',
      id: 'test id'
    }
    const testStreet = {
      creatorId: 'test creator',
      location: null
    }
    const wrapper = shallow(
      <GeotagDialog.WrappedComponent
        street={testStreet}
        addressInformation={testAddressInfo}
        markerLocation={testMarker}
      />
    )
    getRemixOnFirstEdit.mockReturnValueOnce(true)
    wrapper.setProps({
      markerLocation: { lat: 10, lng: 10 },
      addressInformation: {
        street: 'test street 2',
        id: 'test id 2'
      }
    })
    expect(wrapper.find('button .confirm-button')).toHaveLength(1)
  })
})
