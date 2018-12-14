/* eslint-env jest */
import React from 'react'
import { GeotagDialogWithIntl as GeotagDialog } from '../GeotagDialog'
import { shallowWithIntl as shallow } from '../../../../test/helpers/intl-enzyme-test-helper.js'
import { getRemixOnFirstEdit } from '../../streets/remix'

// Mock dependencies that could break tests
jest.mock('../../streets/remix', () => ({
  getRemixOnFirstEdit: jest.fn()
}))

function getTestComponent (addressInformation, street) {
  const testMarker = { lat: 0, lng: 0 }
  const testAddressInfo = addressInformation || {
    street: 'foo',
    id: 'foo'
  }
  const testStreet = street || {
    creatorId: 'foo',
    location: {
      label: 'foo',
      wofId: 'foo'
    }
  }

  return (
    <GeotagDialog
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
      <GeotagDialog
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
    expect(wrapper.find('button')).toHaveLength(0)
  })

  it('allows a location to be confirmed when the current signed-in user is the street owner', () => {
    const wrapper = shallow(getTestComponent())
    getRemixOnFirstEdit.mockReturnValueOnce(false)
    updateProps(wrapper)
    expect(wrapper.instance().canEditLocation()).toEqual(true)
  })

  it('allows a location to be confirmed when the current anonymous user started this street', () => {
    const wrapper = shallow(getTestComponent())
    getRemixOnFirstEdit.mockReturnValueOnce(false)
    updateProps(wrapper)
    expect(wrapper.instance().canEditLocation()).toEqual(true)
  })

  it('does not allow a location to be confirmed when the current signed-in user is not the street owner', () => {
    const wrapper = shallow(getTestComponent())
    getRemixOnFirstEdit.mockReturnValueOnce(true)
    updateProps(wrapper)
    expect(wrapper.find('button')).toHaveLength(0)
  })

  it('does not allow a location to be confirmed when the current anonymous user is not the street owner and there is already an existing location attached', () => {
    const wrapper = shallow(getTestComponent())
    getRemixOnFirstEdit.mockReturnValueOnce(true)
    updateProps(wrapper)
    expect(wrapper.find('button')).toHaveLength(0)
  })

  it('allows a location to be confirmed when the current anonymous user is not the street owner but there is no existing location attached', () => {
    const testStreet = {
      creatorId: 'foo',
      location: null
    }
    const wrapper = shallow(getTestComponent(null, testStreet))
    getRemixOnFirstEdit.mockReturnValueOnce(true)
    updateProps(wrapper)
    expect(wrapper.instance().canEditLocation()).toEqual(true)
  })

  // Skip tests until we figure out how to actually test components that use render propsq
  it.skip('does not show error banner if geocoding services are available', () => {
    const wrapper = shallow(getTestComponent())
    wrapper.setState({ geocodeAvailable: true })
    expect(wrapper.find('.geotag-error-banner')).toHaveLength(0)
    expect(wrapper.find('.geotag-input-container')).toHaveLength(1)
  })

  it.skip('cripples dialog behavior if geocoding services are unavailable', () => {
    const wrapper = shallow(getTestComponent())
    wrapper.setState({ geocodeAvailable: false })
    expect(wrapper.find('.geotag-error-banner')).toHaveLength(1)
    expect(wrapper.find('.geotag-input-container')).toHaveLength(0)
  })
})
