/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import MOCK_STREET from '../../../../test/fixtures/street.json'
import Gallery from '../Gallery'
import { switchGalleryStreet } from '../view'
import { closeGallery } from '../../store/actions/gallery'

jest.mock('../view')
jest.mock('../../app/errors')
jest.mock('../../streets/thumbnail')
jest.mock('../../streets/xhr')
jest.mock('../../store/actions/gallery', () => ({
  closeGallery: jest.fn(() => ({ type: 'MOCK_ACTION' }))
}))

const initialState = {
  gallery: {
    userId: 'foo',
    visible: true,
    mode: 'GALLERY',
    streets: [MOCK_STREET]
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

describe('Gallery', () => {
  it('renders main gallery view for user’s own streets', () => {
    const { asFragment } = renderWithReduxAndIntl(<Gallery />, { initialState })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders main gallery view for another user’s streets', () => {
    const { asFragment } = renderWithReduxAndIntl(<Gallery />, {
      initialState: {
        ...initialState,
        user: {
          signedIn: true,
          signInData: {
            userId: 'bar'
          }
        }
      }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders global gallery view', () => {
    const initialState = {
      gallery: {
        visible: true,
        mode: 'GALLERY',
        streets: [MOCK_STREET]
      },
      street: {
        id: '2556be10-df45-11e9-92a0-b5e383de159b'
      },
      user: {
        signedIn: false
      }
    }

    const { asFragment } = renderWithReduxAndIntl(<Gallery />, { initialState })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders loading', () => {
    const initialState = {
      gallery: {
        visible: true,
        mode: 'LOADING'
      }
    }

    const { asFragment } = renderWithReduxAndIntl(<Gallery />, { initialState })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders error', () => {
    const initialState = {
      gallery: {
        visible: true,
        mode: 'ERROR'
      }
    }

    renderWithReduxAndIntl(<Gallery />, { initialState })
    expect(screen.getByText('Failed to load the gallery.')).toBeInTheDocument()
  })

  it('closes on shield click', () => {
    const initialState = {
      gallery: {
        visible: true,
        mode: 'GALLERY'
      }
    }

    renderWithReduxAndIntl(<Gallery />, { initialState })
    userEvent.click(screen.getByTestId('gallery-shield'))
    expect(closeGallery).toHaveBeenCalledTimes(1)
  })

  describe('street item', () => {
    it('selects street', () => {
      const { getByText } = renderWithReduxAndIntl(<Gallery />, {
        initialState
      })
      userEvent.click(getByText('Baz'))
      expect(switchGalleryStreet).toHaveBeenCalledWith(initialState.street.id)
    })

    it('deletes street', () => {
      const { getByTitle, queryByTitle } = renderWithReduxAndIntl(<Gallery />, {
        initialState
      })
      userEvent.click(getByTitle('Delete street'))

      // There's only one street "displayed" so we expect no "delete street"
      // button to be rendered anymore, since that street should be deleted.
      expect(queryByTitle('Delete street')).not.toBeInTheDocument()
    })
  })
})
