import { screen } from '@testing-library/react'
import clone from 'just-clone'
import React from 'react'
import { type Mock, vi } from 'vitest'

import * as constants from '~/src/app/config'
import { isOwnedByCurrentUser } from '~/src/streets/owner'
import { render } from '~/test/helpers/render'
import GeotagDialog from './GeotagDialog'

// Mock this method to allow it to return values we need for test
vi.mock('../../streets/owner', () => ({
  isOwnedByCurrentUser: vi.fn(),
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
        lng: 0,
      },
    },
  },
  map: {
    markerLocation: { lat: -1, lng: -1 },
    addressInformation: {
      street: 'Null Island Port',
      label: 'Null Island Port, Null Island',
      id: 'polyline123',
    },
  },
  system: {
    devicePixelRatio: 1,
    offline: false,
  },
}

describe('GeotagDialog', () => {
  it('renders', () => {
    const { asFragment } = render(<GeotagDialog />, {
      initialState,
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('allows a location to be cleared when the street is owned by the current user', () => {
    ;(isOwnedByCurrentUser as Mock).mockReturnValueOnce(true)
    render(<GeotagDialog />, {
      initialState,
    })

    expect(
      screen.getByRole('button', { name: 'Clear location' })
    ).toBeInTheDocument()
  })

  it('allows a location to be added when the current user started this street', () => {
    ;(isOwnedByCurrentUser as Mock).mockReturnValueOnce(true)
    render(<GeotagDialog />, {
      initialState: {
        ...initialState,
        street: {
          creatorId: 'mayorofnullisland',
          location: null,
        },
      },
    })
    expect(
      screen.getByRole('button', { name: 'Confirm location' })
    ).toBeInTheDocument()
  })

  /* neither confirm or clear location buttons should show up in this case */
  it('does not allow a location to be edited when the current user is not the street owner', () => {
    ;(isOwnedByCurrentUser as Mock).mockReturnValueOnce(false)
    render(<GeotagDialog />, {
      initialState,
    })
    // in this case we want to make sure neither button shows up, so we use regex to check the button name
    expect(
      screen.queryByRole('button', { name: /Confirm location|Clear location/ })
    ).not.toBeInTheDocument()
  })

  it('allows a location to be confirmed when the current anonymous user is not the street owner but there is no existing location attached', () => {
    ;(isOwnedByCurrentUser as Mock).mockReturnValueOnce(false)
    render(<GeotagDialog />, {
      initialState: {
        ...initialState,
        street: {
          creatorId: 'creatorMadeThisWithNoLocation',
          location: null,
        },
      },
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
      // Set API key to undefined
      vi.spyOn(constants, 'PELIAS_API_KEY', 'get').mockReturnValue(undefined)

      render(<GeotagDialog />, { initialState })

      expect(screen.getByText(errorText, { exact: false })).toBeInTheDocument()
      expect(
        screen.queryByPlaceholderText(placeholderText)
      ).not.toBeInTheDocument()

      // Restore API key value
      vi.restoreAllMocks()
    })

    it('shows geocoding is unavailable if geocoder host name is not set', () => {
      // Set API key to undefined
      vi.spyOn(constants, 'PELIAS_API_KEY', 'get').mockReturnValue(undefined)

      render(<GeotagDialog />, { initialState })

      expect(screen.getByText(errorText, { exact: false })).toBeInTheDocument()
      expect(
        screen.queryByPlaceholderText(placeholderText)
      ).not.toBeInTheDocument()

      // Restore API key value
      vi.restoreAllMocks()
    })

    it('shows geocoding is unavailable if offline mode is on', () => {
      const newInitialState = clone(initialState)
      newInitialState.system.offline = true

      render(<GeotagDialog />, {
        initialState: newInitialState,
      })

      expect(screen.getByText(errorText, { exact: false })).toBeInTheDocument()
      expect(
        screen.queryByPlaceholderText(placeholderText)
      ).not.toBeInTheDocument()
    })
  })
})
