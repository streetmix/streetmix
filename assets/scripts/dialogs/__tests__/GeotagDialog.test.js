/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import GeotagDialog from '../GeotagDialog'
import { isOwnedByCurrentUser } from '../../streets/owner'
import { screen } from '@testing-library/react'

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
    devicePixelRatio: 1
  }
}

describe('GeotagDialog', () => {
  it('renders', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <GeotagDialog renderPopup={true} />,
      { initialState }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('allows a location to be cleared when the street is owned by the current user', () => {
    isOwnedByCurrentUser.mockReturnValueOnce(true)
    renderWithReduxAndIntl(<GeotagDialog />, {
      initialState
    })

    expect(
      screen.queryByRole('button', { name: 'Clear location' })
    ).toBeInTheDocument()
  })

  it('allows a location to be added when the current user started this street', () => {
    isOwnedByCurrentUser.mockReturnValueOnce(true)
    renderWithReduxAndIntl(<GeotagDialog />, {
      initialState: {
        ...initialState,
        street: {
          creatorId: 'mayorofnullisland',
          location: null
        }
      }
    })
    expect(
      screen.queryByRole('button', { name: 'Confirm location' })
    ).toBeInTheDocument()
  })

  /* neither confirm or clear location buttons should show up in this case */
  it('does not allow a location to be edited when the current user is not the street owner', () => {
    isOwnedByCurrentUser.mockReturnValueOnce(false)
    renderWithReduxAndIntl(<GeotagDialog />, {
      initialState
    })
    // in this case we want to make sure neither button shows up, so we use regex to check the button name
    expect(
      screen.queryByRole('button', { name: /Confirm location|Clear location/ })
    ).not.toBeInTheDocument()
  })

  it('allows a location to be confirmed when the current anonymous user is not the street owner but there is no existing location attached', () => {
    isOwnedByCurrentUser.mockReturnValueOnce(false)
    renderWithReduxAndIntl(<GeotagDialog />, {
      initialState: {
        ...initialState,
        street: {
          creatorId: 'creatorMadeThisWithNoLocation',
          location: null
        }
      }
    })

    expect(
      screen.queryByRole('button', { name: 'Confirm location' })
    ).toBeInTheDocument()
  })
  it.todo('does not show error banner if geocoding services are available')
  it.todo('cripples dialog behavior if geocoding services are unavailable')
})
