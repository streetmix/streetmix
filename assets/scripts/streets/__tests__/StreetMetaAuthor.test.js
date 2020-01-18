/* eslint-env jest */
import React from 'react'
import StreetMetaAuthor from '../StreetMetaAuthor'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import { getRemixOnFirstEdit } from '../../streets/remix'

// Enable mocking of the return value of `getRemixOnFirstEdit`
jest.mock('../../streets/remix')

describe('StreetMetaAuthor', () => {
  it('renders nothing if you own the street', () => {
    const { container } = renderWithReduxAndIntl(<StreetMetaAuthor />, {
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

  it('renders street creator byline if you are signed in and it’s not yours', () => {
    const { getByText } = renderWithReduxAndIntl(<StreetMetaAuthor />, {
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

    expect(getByText('foo')).toBeInTheDocument()
  })

  it('renders street creator byline if you are not signed in', () => {
    const { getByText } = renderWithReduxAndIntl(<StreetMetaAuthor />, {
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

    expect(getByText('foo')).toBeInTheDocument()
  })

  it('renders anonymous byline if you are signed in', () => {
    const { getByText } = renderWithReduxAndIntl(<StreetMetaAuthor />, {
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
    getRemixOnFirstEdit.mockImplementationOnce(() => true)
    const { getByText } = renderWithReduxAndIntl(<StreetMetaAuthor />, {
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
    getRemixOnFirstEdit.mockImplementationOnce(() => false)
    const { container } = renderWithReduxAndIntl(<StreetMetaAuthor />, {
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
