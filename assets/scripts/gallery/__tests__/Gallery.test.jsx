/* eslint-env jest */
import React from 'react'
import { cleanup, fireEvent } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import Gallery from '../Gallery'
import { hideGallery } from '../view'

jest.mock('../view')
jest.mock('../thumbnail')

const mockStreet = {
  id: '2556be10-df45-11e9-92a0-b5e383de159b',
  namespacedId: 435,
  data: {
    street: {
      schemaVersion: 19,
      width: 80,
      id: '2556be10-df45-11e9-92a0-b5e383de159b',
      namespacedId: 435,
      units: 2,
      location: {
        latlng: 'Object',
        wofId: '85632717',
        label: 'Azerbaijan',
        hierarchy: 'Object',
        geometryId: null,
        intersectionId: null
      },
      userUpdated: false,
      environment: 'day',
      leftBuildingHeight: 3,
      rightBuildingHeight: 2,
      leftBuildingVariant: 'narrow',
      rightBuildingVariant: 'wide',
      segments: [
        'Object',
        'Object'
      ],
      editCount: 33
    }
  },
  createdAt: '2019-09-25T03:32:48.377Z',
  updatedAt: '2019-09-25T19:29:22.547Z',
  originalStreetId: '33138040-df29-11e9-8f01-c72511055ed4',
  creator: {
    id: 'foo'
  },
  creatorId: 'foo'
}

describe('Gallery', () => {
  afterEach(cleanup)

  it('renders main gallery view for user’s own streets', () => {
    const initialState = {
      gallery: {
        userId: 'foo',
        visible: true,
        mode: 'GALLERY',
        streets: [
          mockStreet
        ]
      },
      street: {
        id: '2556be10-df45-11e9-92a0-b5e383de159b'
      },
      user: {
        signedIn: true,
        signInData: {
          userId: 'foo'
        }
      }
    }

    const wrapper = renderWithReduxAndIntl(<Gallery />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders main gallery view for another user’s streets', () => {
    const initialState = {
      gallery: {
        userId: 'foo',
        visible: true,
        mode: 'GALLERY',
        streets: [
          mockStreet
        ]
      },
      street: {
        id: '2556be10-df45-11e9-92a0-b5e383de159b'
      },
      user: {
        signedIn: true,
        signInData: {
          userId: 'bar'
        }
      }
    }

    const wrapper = renderWithReduxAndIntl(<Gallery />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders global gallery view', () => {
    const initialState = {
      gallery: {
        visible: true,
        mode: 'GALLERY',
        streets: [
          mockStreet
        ]
      },
      street: {
        id: '2556be10-df45-11e9-92a0-b5e383de159b'
      },
      user: {
        signedIn: false
      }
    }

    const wrapper = renderWithReduxAndIntl(<Gallery />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders loading', () => {
    const initialState = {
      gallery: {
        visible: true,
        mode: 'LOADING'
      }
    }

    const wrapper = renderWithReduxAndIntl(<Gallery />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders sign-in-promo', () => {
    const initialState = {
      gallery: {
        visible: true,
        mode: 'SIGN_IN_PROMO'
      }
    }

    const wrapper = renderWithReduxAndIntl(<Gallery />, { initialState })
    expect(wrapper.getByText('Sign in for your personal street gallery')).toBeInTheDocument()
  })

  it('renders error', () => {
    const initialState = {
      gallery: {
        visible: true,
        streets: 'boom'
      }
    }

    // Setup: Swallow console.error
    jest.spyOn(console, 'error')
    console.error.mockImplementation(() => {})

    // Render with bad data, causing an error to occur
    const wrapper = renderWithReduxAndIntl(<Gallery />, { initialState })

    // Expect the error to occur.
    // Note that if this test does fail with an error, we've set it up to swallow
    // actual console.errors, so remove the mock if you need to debug this test.
    expect(wrapper.getByText('Failed to load the gallery.')).toBeInTheDocument()

    // Restore console.error
    console.error.mockRestore()
  })

  it('closes on shield click', () => {
    const initialState = {
      gallery: {
        visible: true,
        mode: 'GALLERY'
      }
    }

    const wrapper = renderWithReduxAndIntl(<Gallery />, { initialState })
    fireEvent.click(wrapper.container.querySelector('.gallery-shield'))
    expect(hideGallery).toHaveBeenCalled()
  })
})
