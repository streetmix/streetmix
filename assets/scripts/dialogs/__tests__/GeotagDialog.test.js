/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import GeotagDialog from '../GeotagDialog'
import { isOwnedByCurrentUser } from '../../streets/owner'

// Mock dependencies that could break tests
jest.mock('../../streets/owner', () => ({
  isOwnedByCurrentUser: jest.fn()
}))

const initialState = {
  street: {
    creatorId: 'foo',
    location: {
      label: 'foo',
      wofId: 'foo'
    }
  },
  map: {
    markerLocation: { lat: 0, lng: 0 },
    addressInformation: {
      street: 'foo',
      id: 'foo'
    }
  },
  user: {
    geolocation: {
      data: {
        lat: 10,
        lng: 10
      }
    }
  },
  system: {
    devicePixelRatio: 1
  }
}

describe('GeotagDialog', () => {
  it('renders', () => {
    const wrapper = renderWithReduxAndIntl(<GeotagDialog />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('does not allow a location to be confirmed when geocoded data does not have street data', () => {
    const wrapper = renderWithReduxAndIntl(<GeotagDialog />, {
      initialState: {
        ...initialState,
        street: {}
      }
    })

    expect(wrapper.queryByText('Confirm location')).not.toBeInTheDocument()
  })

  // TODO: Fix these tests
  it.skip('allows a location to be confirmed when the current signed-in user is the street owner', () => {
    isOwnedByCurrentUser.mockReturnValueOnce(true)
    const wrapper = renderWithReduxAndIntl(<GeotagDialog />, { initialState })

    expect(wrapper.queryByText('Confirm location')).toBeInTheDocument()
  })

  it.skip('allows a location to be confirmed when the current anonymous user started this street', () => {
    isOwnedByCurrentUser.mockReturnValueOnce(true)
    const wrapper = renderWithReduxAndIntl(<GeotagDialog />, { initialState })

    expect(wrapper.queryByText('Confirm location')).toBeInTheDocument()
  })

  it('does not allow a location to be confirmed when the current signed-in user is not the street owner', () => {
    isOwnedByCurrentUser.mockReturnValueOnce(false)
    const wrapper = renderWithReduxAndIntl(<GeotagDialog />, { initialState })

    expect(wrapper.queryByText('Confirm location')).not.toBeInTheDocument()
  })

  it.skip('allows a location to be confirmed when the current anonymous user is not the street owner but there is no existing location attached', () => {
    isOwnedByCurrentUser.mockReturnValueOnce(false)
    const wrapper = renderWithReduxAndIntl(<GeotagDialog />, {
      initialState: {
        ...initialState,
        street: {
          creatorId: 'foo',
          location: null
        }
      }
    })

    expect(wrapper.queryByText('Confirm location')).toBeInTheDocument()
  })

  it.todo('does not show error banner if geocoding services are available')
  it.todo('cripples dialog behavior if geocoding services are unavailable')
})
