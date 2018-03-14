/* eslint-env jest */
import React from 'react'
import GeotagDialog from '../GeotagDialog'
import { shallow } from 'enzyme'
import { getRemixOnFirstEdit } from '../../streets/remix'

// Mock dependencies that could break tests
jest.mock('../../streets/remix', () => ({
  getRemixOnFirstEdit: jest.fn()
}))

function getTestComponent (addressInformation = null, street = null) {
  const testMarker = { lat: 0, lng: 0 }
  let testAddressInfo = {
    street: 'foo',
    id: 'foo'
  }
  let testStreet = {
    creatorId: 'foo',
    location: {
      label: 'foo',
      wofId: 'foo'
    }
  }

  if (addressInformation) {
    testAddressInfo = addressInformation
  }

  if (street) {
    testStreet = street
  }

  return (
    <GeotagDialog.WrappedComponent
      street={testStreet}
      addressInformation={testAddressInfo}
      markerLocation={testMarker}
    />
  )
}

function updateProps (wrapper) {
  wrapper.setProps({
    markerLocation: { lat: 10, lng: 10 },
    addressInformation: {
      street: 'bar',
      id: 'bar'
    }
  })
}

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
    const testAddressInfo = {
      street: null
    }
    const wrapper = shallow(getTestComponent(testAddressInfo, {}))
    expect(wrapper.find('button .confirm-button')).toHaveLength(0)
  })

  it('allows a location to be confirmed when the current signed-in user is the street owner', () => {
    const wrapper = shallow(getTestComponent())
    getRemixOnFirstEdit.mockReturnValueOnce(false)
    updateProps(wrapper)
    expect(wrapper.find('button .confirm-button')).toHaveLength(1)
  })

  it('allows a location to be confirmed when the current anonymous user started this street', () => {
    const wrapper = shallow(getTestComponent())
    getRemixOnFirstEdit.mockReturnValueOnce(false)
    updateProps(wrapper)
    expect(wrapper.find('button .confirm-button')).toHaveLength(1)
  })

  it('does not allow a location to be confirmed when the current signed-in user is not the street owner', () => {
    const wrapper = shallow(getTestComponent())
    getRemixOnFirstEdit.mockReturnValueOnce(true)
    updateProps(wrapper)
    expect(wrapper.find('button .confirm-button')).toHaveLength(0)
  })

  it('does not allow a location to be confirmed when the current anonymous user is not the street owner and there is already an existing location attached', () => {
    const wrapper = shallow(getTestComponent())
    getRemixOnFirstEdit.mockReturnValueOnce(true)
    updateProps(wrapper)
    expect(wrapper.find('button .confirm-button')).toHaveLength(0)
  })

  it('allows a location to be confirmed when the current anonymous user is not the street owner but there is no existing location attached', () => {
    const testStreet = {
      creatorId: 'foo',
      location: null
    }
    const wrapper = shallow(getTestComponent(null, testStreet))
    getRemixOnFirstEdit.mockReturnValueOnce(true)
    updateProps(wrapper)
    expect(wrapper.find('button .confirm-button')).toHaveLength(1)
  })
})
