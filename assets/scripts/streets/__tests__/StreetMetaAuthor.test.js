/* eslint-env jest */
import React from 'react'
import userEvent from '@testing-library/user-event'
import StreetMetaAuthor from '../StreetMetaAuthor'
import { render } from '../../../../test/helpers/render'
import { isOwnedByCurrentUser } from '../../streets/owner'
import { openGallery } from '../../store/actions/gallery'

// Enable mocking of the return value of `isOwnedByCurrentUser`
jest.mock('../../streets/owner')

jest.mock('../../store/actions/gallery', () => ({
  openGallery: jest.fn((id) => ({ type: 'MOCK_ACTION' }))
}))

describe('StreetMetaAuthor', () => {
  afterEach(() => {
    // Resets mock call counter between tests
    openGallery.mockClear()
  })

  it('renders nothing if you own the street', () => {
    const { container } = render(<StreetMetaAuthor />, {
      initialState: {
        street: {
          creatorId: 'foo'
        },
        user: {
          signedIn: true,
          signInData: {
            userId: 'foo'
          }
        }
      }
    })

    expect(container.firstChild).toBe(null)
  })

  it('renders street creator byline if you are signed in and it’s not yours', async () => {
    const { getByText } = render(<StreetMetaAuthor />, {
      initialState: {
        street: {
          creatorId: 'foo'
        },
        user: {
          signedIn: true,
          signInData: {
            userId: 'bar'
          }
        }
      }
    })

    await userEvent.click(getByText('foo'))
    expect(openGallery).toBeCalledTimes(1)
    expect(openGallery).toBeCalledWith({ userId: 'foo' })
  })

  it('renders street creator byline if you are not signed in', async () => {
    const { getByText } = render(<StreetMetaAuthor />, {
      initialState: {
        street: {
          creatorId: 'foo'
        },
        user: {
          signedIn: false,
          signInData: {
            userId: null
          }
        }
      }
    })

    await userEvent.click(getByText('foo'))
    expect(openGallery).toBeCalledTimes(1)
    expect(openGallery).toBeCalledWith({ userId: 'foo' })
  })

  it('renders anonymous byline if you are signed in', () => {
    const { getByText } = render(<StreetMetaAuthor />, {
      initialState: {
        street: {
          creatorId: null
        },
        user: {
          signedIn: true,
          signInData: {
            userId: 'bar'
          }
        }
      }
    })

    expect(getByText('by Anonymous')).toBeInTheDocument()
  })

  it('renders anonymous byline if you are not logged in and viewing an anonymous street', () => {
    isOwnedByCurrentUser.mockImplementationOnce(() => false)
    const { getByText } = render(<StreetMetaAuthor />, {
      initialState: {
        street: {
          creatorId: null
        },
        user: {
          signedIn: false,
          signInData: {
            userId: null
          }
        }
      }
    })

    expect(getByText('by Anonymous')).toBeInTheDocument()
  })

  it('renders nothing if you are a not-logged in user still editing an anonymous street', () => {
    isOwnedByCurrentUser.mockImplementationOnce(() => true)
    const { container } = render(<StreetMetaAuthor />, {
      initialState: {
        street: {
          creatorId: null
        },
        user: {
          signedIn: false,
          signInData: {
            userId: null
          }
        }
      }
    })

    expect(container.firstChild).toBe(null)
  })
})
