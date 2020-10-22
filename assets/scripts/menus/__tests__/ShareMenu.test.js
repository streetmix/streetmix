/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import copy from 'copy-to-clipboard'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import ShareMenu from '../ShareMenu'
import { showDialog } from '../../store/slices/dialogs'

jest.mock('copy-to-clipboard')
jest.mock('../../store/slices/dialogs', () => ({
  showDialog: jest.fn((id) => ({ type: 'MOCK_ACTION' }))
}))

describe('ShareMenu', () => {
  afterEach(() => {
    showDialog.mockClear()
  })

  it('renders (user not signed in, anonymous user’s street, no street name)', () => {
    const { asFragment } = renderWithReduxAndIntl(<ShareMenu />, {
      initialState: { user: { signedIn: false } }
    })

    // Check for proper sharing messages
    const message = 'Check out this street on Streetmix!'
    const twitterLink = screen.getByText('Twitter', { exact: false }).href
    const facebookLink = screen.getByText('Facebook', { exact: false }).href
    expect(twitterLink.replace(/%20/g, ' ')).toMatch(message)
    expect(facebookLink.replace(/%20/g, ' ')).toMatch(message)

    expect(asFragment()).toMatchSnapshot()
  })

  it('renders (user signed in, own street, with name)', () => {
    const { asFragment } = renderWithReduxAndIntl(<ShareMenu />, {
      initialState: {
        user: {
          signedIn: true,
          signInData: {
            userId: 'foo'
          }
        },
        street: {
          creatorId: 'foo',
          name: 'bar'
        }
      }
    })

    // Check for proper sharing messages
    const message = 'Check out my street, bar, on Streetmix!'
    const twitterLink = screen.getByText('Twitter', { exact: false }).href
    const facebookLink = screen.getByText('Facebook', { exact: false }).href
    expect(twitterLink.replace(/%20/g, ' ').replace(/%2C/g, ',')).toMatch(
      message
    )
    expect(facebookLink.replace(/%20/g, ' ').replace(/%2C/g, ',')).toMatch(
      message
    )

    expect(asFragment()).toMatchSnapshot()
  })

  // Test other share messages; no snapshots rendered
  describe('other share messages', () => {
    it('user signed in, own street, no street name', () => {
      renderWithReduxAndIntl(<ShareMenu />, {
        initialState: {
          user: {
            signedIn: true,
            signInData: {
              userId: 'foo'
            }
          },
          street: {
            creatorId: 'foo'
          }
        }
      })

      const message = 'Check out my street on Streetmix!'
      const twitterLink = screen.getByText('Twitter', { exact: false }).href
      const facebookLink = screen.getByText('Facebook', { exact: false }).href

      expect(twitterLink.replace(/%20/g, ' ')).toMatch(message)
      expect(facebookLink.replace(/%20/g, ' ')).toMatch(message)
    })

    it('another user’s street, with street name', () => {
      renderWithReduxAndIntl(<ShareMenu />, {
        initialState: {
          user: {
            signedIn: true,
            signInData: {
              userId: 'foo'
            }
          },
          street: {
            creatorId: 'qux',
            name: 'bar'
          }
        }
      })

      const message = 'Check out bar by @qux on Streetmix!'
      const twitterLink = screen.getByText('Twitter', { exact: false }).href
      const facebookLink = screen.getByText('Facebook', { exact: false }).href

      expect(twitterLink.replace(/%20/g, ' ').replace(/%40/g, '@')).toMatch(
        message
      )
      expect(facebookLink.replace(/%20/g, ' ').replace(/%40/g, '@')).toMatch(
        message
      )
    })

    it('another user’s street, no street name', () => {
      renderWithReduxAndIntl(<ShareMenu />, {
        initialState: {
          user: {
            signedIn: true,
            signInData: {
              userId: 'foo'
            }
          },
          street: {
            creatorId: 'qux'
          }
        }
      })

      const message = 'Check out this street by @qux on Streetmix!'
      const twitterLink = screen.getByText('Twitter', { exact: false }).href
      const facebookLink = screen.getByText('Facebook', { exact: false }).href

      expect(twitterLink.replace(/%20/g, ' ').replace(/%40/g, '@')).toMatch(
        message
      )
      expect(facebookLink.replace(/%20/g, ' ').replace(/%40/g, '@')).toMatch(
        message
      )
    })

    it('anonymous user’s street, with street name', () => {
      renderWithReduxAndIntl(<ShareMenu />, {
        initialState: {
          user: {
            signedIn: true,
            signInData: {
              userId: 'foo'
            }
          },
          street: {
            name: 'bar'
          }
        }
      })

      const message = 'Check out bar on Streetmix!'
      const twitterLink = screen.getByText('Twitter', { exact: false }).href
      const facebookLink = screen.getByText('Facebook', { exact: false }).href

      expect(twitterLink.replace(/%20/g, ' ').replace(/%40/g, '@')).toMatch(
        message
      )
      expect(facebookLink.replace(/%20/g, ' ').replace(/%40/g, '@')).toMatch(
        message
      )
    })
  })

  it('handles clicking sign in link', () => {
    renderWithReduxAndIntl(<ShareMenu />, {
      initialState: { user: { signedIn: false } }
    })
    userEvent.click(screen.getByText('Sign in'))
    expect(showDialog).toBeCalledTimes(1)
    expect(showDialog).toBeCalledWith('SIGN_IN')
  })

  it('handles clicking Twitter', () => {
    renderWithReduxAndIntl(<ShareMenu />)
    userEvent.click(screen.getByText('Twitter', { exact: false }))
  })

  it('handles clicking Facebook', () => {
    renderWithReduxAndIntl(<ShareMenu />)
    userEvent.click(screen.getByText('Facebook', { exact: false }))
  })

  it('handles clicking save as image', () => {
    renderWithReduxAndIntl(<ShareMenu />)
    userEvent.click(screen.getByText('Save as image', { exact: false }))
    expect(showDialog).toBeCalledTimes(1)
    expect(showDialog).toBeCalledWith('SAVE_AS_IMAGE')
  })

  it('handles clicking print', () => {
    const { store } = renderWithReduxAndIntl(<ShareMenu />)
    userEvent.click(screen.getByText('Print', { exact: false }))
    expect(store.getState().app.printing).toBe(true)
  })

  it('handles clicking copy to clipboard', () => {
    renderWithReduxAndIntl(<ShareMenu />)
    userEvent.click(screen.getByTitle('Copy to clipboard'))
    expect(copy).toBeCalledTimes(1)
  })

  it('does not render external share links in no internet mode', () => {
    const { asFragment } = renderWithReduxAndIntl(<ShareMenu />, {
      initialState: { system: { noInternet: true } }
    })

    expect(asFragment()).toMatchSnapshot()
  })
})
