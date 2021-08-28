/* eslint-env jest */
import React from 'react'
import { cloneDeep } from 'lodash'
import { screen } from '@testing-library/react'
import { render } from '../../../../test/helpers/render'
import GeotagDialog from '../GeotagDialog'
import { isOwnedByCurrentUser } from '../../streets/owner'
import * as constants from '../../app/config'

// Mock dependencies that could break tests
jest.mock('../../streets/owner', () => ({
  isOwnedByCurrentUser: jest.fn()
}))

// as mocked, the intial state is a street with a previously saved location, and a new marker location
// in practice, these tests don't really handle this 'new' marker location yet

const initialState = {
  street: {
    creatorId: 'mayorofnullisland',
    location: {
      label: 'Null Island',
      wofId: '1234',
      latlng: {
        lat: 0,
        lng: 0
      }
    }
  },
  map: {
    markerLocation: { lat: -1, lng: -1 },
    addressInformation: {
      street: 'Null Island Port',
      label: 'Null Island Port, Null Island',
      id: 'polyline123'
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
    devicePixelRatio: 1,
    offline: false
  }
}

describe('GeotagDialog', () => {
  it('renders', () => {
    const { asFragment } = render(<GeotagDialog renderPopup={true} />, {
      initialState
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('allows a location to be cleared when the street is owned by the current user', () => {
    isOwnedByCurrentUser.mockReturnValueOnce(true)
    render(<GeotagDialog />, {
      initialState
    })

    expect(
      screen.getByRole('button', { name: 'Clear location' })
    ).toBeInTheDocument()
  })

  it('allows a location to be added when the current user started this street', () => {
    isOwnedByCurrentUser.mockReturnValueOnce(true)
    render(<GeotagDialog />, {
      initialState: {
        ...initialState,
        street: {
          creatorId: 'mayorofnullisland',
          location: null
        }
      }
    })
    expect(
      screen.getByRole('button', { name: 'Confirm location' })
    ).toBeInTheDocument()
  })

  /* neither confirm or clear location buttons should show up in this case */
  it('does not allow a location to be edited when the current user is not the street owner', () => {
    isOwnedByCurrentUser.mockReturnValueOnce(false)
    render(<GeotagDialog />, {
      initialState
    })
    // in this case we want to make sure neither button shows up, so we use regex to check the button name
    expect(
      screen.queryByRole('button', { name: /Confirm location|Clear location/ })
    ).not.toBeInTheDocument()
  })

  it('allows a location to be confirmed when the current anonymous user is not the street owner but there is no existing location attached', () => {
    isOwnedByCurrentUser.mockReturnValueOnce(false)
    render(<GeotagDialog />, {
      initialState: {
        ...initialState,
        street: {
          creatorId: 'creatorMadeThisWithNoLocation',
          location: null
        }
      }
    })

    expect(
      screen.getByRole('button', { name: 'Confirm location' })
    ).toBeInTheDocument()
  })

  describe('geocoding availability', () => {
    const errorText = 'Geocoding services are currently unavailable'
    const placeholderText = 'Search for a location'

    it('does not show error banner if geocoding services are available', () => {
      render(<GeotagDialog />, { initialState })

      expect(
        screen.queryByText(errorText, { exact: false })
      ).not.toBeInTheDocument()
      expect(screen.getByPlaceholderText(placeholderText)).toBeInTheDocument()
    })

    it('shows geocoding is unavailable if geocoder key is unset', () => {
      // Set imported config constants to undefined
      const origApiKey = constants.PELIAS_API_KEY
      constants.PELIAS_API_KEY = undefined // eslint-disable-line

      render(<GeotagDialog />, { initialState })

      expect(screen.getByText(errorText, { exact: false })).toBeInTheDocument()
      expect(
        screen.queryByPlaceholderText(placeholderText)
      ).not.toBeInTheDocument()

      // Restore constants
      constants.PELIAS_API_KEY = origApiKey // eslint-disable-line
    })

    it('shows geocoding is unavailable if geocoder host name is not set', () => {
      // Set imported config constants to undefined
      const origHostHame = constants.PELIAS_HOST_NAME
      constants.PELIAS_HOST_NAME = undefined // eslint-disable-line

      render(<GeotagDialog />, { initialState })

      expect(screen.getByText(errorText, { exact: false })).toBeInTheDocument()
      expect(
        screen.queryByPlaceholderText(placeholderText)
      ).not.toBeInTheDocument()

      // Restore constants
      constants.PELIAS_HOST_NAME = origHostHame // eslint-disable-line
    })

    it('shows geocoding is unavailable if offline mode is on', () => {
      const newInitialState = cloneDeep(initialState)
      newInitialState.system.offline = true

      render(<GeotagDialog />, {
        initialState: newInitialState
      })

      expect(screen.getByText(errorText, { exact: false })).toBeInTheDocument()
      expect(
        screen.queryByPlaceholderText(placeholderText)
      ).not.toBeInTheDocument()
    })
  })
})
