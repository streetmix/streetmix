import React from 'react'
import { vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import MOCK_STREET from '~/test/fixtures/street.json'
import { closeGallery } from '~/src/store/actions/gallery'
import Gallery from '../Gallery'
import { switchGalleryStreet } from '../index'

vi.mock('../index')
vi.mock('../../app/errors')
vi.mock('../../streets/thumbnail')
vi.mock('../../streets/xhr')
vi.mock('../../store/actions/gallery', () => ({
  closeGallery: vi.fn(() => ({ type: 'MOCK_ACTION' }))
}))

const initialState = {
  gallery: {
    userId: 'foo',
    visible: true,
    mode: 'gallery',
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
  it('renders main gallery view for user’s own streets', async () => {
    const { getByAltText, asFragment } = render(<Gallery />, { initialState })

    await waitFor(() => {
      // Wait for profile image to load with user id in alt text
      expect(getByAltText('foo')).toBeInTheDocument()
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('renders main gallery view for another user’s streets', async () => {
    const { getByAltText, asFragment } = render(<Gallery />, {
      initialState: {
        ...initialState,
        user: {
          signedIn: true,
          signInData: {
            // We are signed in as user 'baz'
            // We're displaying the gallery for user 'foo'
            userId: 'baz'
          }
        }
      }
    })

    await waitFor(() => {
      // Wait for profile image to load with user id in alt text
      expect(getByAltText('foo')).toBeInTheDocument()
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('renders global gallery view', async () => {
    const initialState = {
      gallery: {
        userId: null,
        visible: true,
        mode: 'gallery',
        streets: [MOCK_STREET]
      },
      street: {
        id: '2556be10-df45-11e9-92a0-b5e383de159b'
      },
      user: {
        signedIn: false
      }
    }

    const { getByText, asFragment } = render(<Gallery />, { initialState })

    await waitFor(() => {
      expect(getByText('All streets')).toBeInTheDocument()
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('renders loading', async () => {
    const initialState = {
      gallery: {
        visible: true,
        mode: 'loading'
      }
    }

    const { asFragment } = render(<Gallery />, { initialState })

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('renders error', async () => {
    const initialState = {
      gallery: {
        visible: true,
        mode: 'error'
      }
    }

    render(<Gallery />, { initialState })

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load the gallery.')
      ).toBeInTheDocument()
    })
  })

  it('closes on shield click', async () => {
    const initialState = {
      gallery: {
        userId: null,
        visible: true,
        mode: 'gallery'
      }
    }

    render(<Gallery />, { initialState })
    await userEvent.click(screen.getByTestId('gallery-shield'))
    expect(closeGallery).toHaveBeenCalledTimes(1)
  })

  describe('street item', () => {
    it('selects street', async () => {
      const { getByText } = render(<Gallery />, {
        initialState
      })

      await waitFor(async () => {
        await userEvent.click(getByText('Baz'))
        expect(switchGalleryStreet).toHaveBeenCalledWith(initialState.street.id)
      })
    })

    it('deletes street', async () => {
      const { getByTitle, queryByTitle } = render(<Gallery />, {
        initialState
      })

      await waitFor(async () => {
        await userEvent.click(getByTitle('Delete street'))

        // There's only one street "displayed" so we expect no "delete street"
        // button to be rendered anymore, since that street should be deleted.
        expect(queryByTitle('Delete street')).not.toBeInTheDocument()
      })
    })
  })
})
