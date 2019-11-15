/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import copy from 'copy-to-clipboard'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import ShareMenu from '../ShareMenu'
import { trackEvent } from '../../app/event_tracking'
import { showDialog } from '../../store/actions/dialogs'
import { startPrinting } from '../../store/actions/app'

jest.mock('copy-to-clipboard')
jest.mock('../../app/event_tracking', () => ({
  trackEvent: jest.fn()
}))
jest.mock('../../store/actions/dialogs', () => ({
  showDialog: jest.fn((id) => ({ type: 'MOCK_ACTION' }))
}))
jest.mock('../../store/actions/app', () => ({
  ...jest.requireActual('../../store/actions/app'),
  startPrinting: jest.fn((id) => ({ type: 'MOCK_ACTION' }))
}))

describe('ShareMenu', () => {
  afterEach(() => {
    trackEvent.mockClear()
    showDialog.mockClear()
    startPrinting.mockClear()
  })

  it('renders (user not signed in, anonymous user’s street, no street name)', () => {
    const wrapper = renderWithReduxAndIntl(<ShareMenu />, {
      initialState: { user: { signedIn: false } }
    })

    // Check for proper sharing messages
    const message = 'Check out this street on Streetmix!'
    const twitterLink = wrapper.getByText('Twitter', { exact: false }).href
    const facebookLink = wrapper.getByText('Facebook', { exact: false }).href
    expect(twitterLink.replace(/%20/g, ' ')).toMatch(message)
    expect(facebookLink.replace(/%20/g, ' ')).toMatch(message)

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders (user signed in, own street, with name)', () => {
    const wrapper = renderWithReduxAndIntl(<ShareMenu />, {
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
    const twitterLink = wrapper.getByText('Twitter', { exact: false }).href
    const facebookLink = wrapper.getByText('Facebook', { exact: false }).href
    expect(twitterLink.replace(/%20/g, ' ').replace(/%2C/g, ',')).toMatch(
      message
    )
    expect(facebookLink.replace(/%20/g, ' ').replace(/%2C/g, ',')).toMatch(
      message
    )

    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  // Test other share messages; no snapshots rendered
  describe('other share messages', () => {
    it('user signed in, own street, no street name', () => {
      const wrapper = renderWithReduxAndIntl(<ShareMenu />, {
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
      const twitterLink = wrapper.getByText('Twitter', { exact: false }).href
      const facebookLink = wrapper.getByText('Facebook', { exact: false }).href

      expect(twitterLink.replace(/%20/g, ' ')).toMatch(message)
      expect(facebookLink.replace(/%20/g, ' ')).toMatch(message)
    })

    it('another user’s street, with street name', () => {
      const wrapper = renderWithReduxAndIntl(<ShareMenu />, {
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
      const twitterLink = wrapper.getByText('Twitter', { exact: false }).href
      const facebookLink = wrapper.getByText('Facebook', { exact: false }).href

      expect(twitterLink.replace(/%20/g, ' ').replace(/%40/g, '@')).toMatch(
        message
      )
      expect(facebookLink.replace(/%20/g, ' ').replace(/%40/g, '@')).toMatch(
        message
      )
    })

    it('another user’s street, no street name', () => {
      const wrapper = renderWithReduxAndIntl(<ShareMenu />, {
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
      const twitterLink = wrapper.getByText('Twitter', { exact: false }).href
      const facebookLink = wrapper.getByText('Facebook', { exact: false }).href

      expect(twitterLink.replace(/%20/g, ' ').replace(/%40/g, '@')).toMatch(
        message
      )
      expect(facebookLink.replace(/%20/g, ' ').replace(/%40/g, '@')).toMatch(
        message
      )
    })

    it('anonymous user’s street, with street name', () => {
      const wrapper = renderWithReduxAndIntl(<ShareMenu />, {
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
      const twitterLink = wrapper.getByText('Twitter', { exact: false }).href
      const facebookLink = wrapper.getByText('Facebook', { exact: false }).href

      expect(twitterLink.replace(/%20/g, ' ').replace(/%40/g, '@')).toMatch(
        message
      )
      expect(facebookLink.replace(/%20/g, ' ').replace(/%40/g, '@')).toMatch(
        message
      )
    })
  })

  it('handles clicking sign in link', () => {
    const wrapper = renderWithReduxAndIntl(<ShareMenu />, {
      initialState: { user: { signedIn: false } }
    })
    fireEvent.click(wrapper.getByText('Sign in'))
    expect(showDialog).toBeCalledTimes(1)
    expect(showDialog).toBeCalledWith('SIGN_IN')
  })

  it('handles clicking Twitter', () => {
    const wrapper = renderWithReduxAndIntl(<ShareMenu />)
    fireEvent.click(wrapper.getByText('Twitter', { exact: false }))
    expect(trackEvent).toBeCalledTimes(1)
  })

  it('handles clicking Facebook', () => {
    const wrapper = renderWithReduxAndIntl(<ShareMenu />)
    fireEvent.click(wrapper.getByText('Facebook', { exact: false }))
    expect(trackEvent).toBeCalledTimes(1)
  })

  it('handles clicking save as image', () => {
    const wrapper = renderWithReduxAndIntl(<ShareMenu />)
    fireEvent.click(wrapper.getByText('Save as image', { exact: false }))
    expect(showDialog).toBeCalledTimes(1)
    expect(showDialog).toBeCalledWith('SAVE_AS_IMAGE')
  })

  it('handles clicking print', () => {
    const wrapper = renderWithReduxAndIntl(<ShareMenu />)
    fireEvent.click(wrapper.getByText('Print', { exact: false }))
    expect(startPrinting).toBeCalledTimes(1)
  })

  it('handles clicking copy to clipboard', () => {
    const wrapper = renderWithReduxAndIntl(<ShareMenu />)
    fireEvent.click(wrapper.getByTitle('Copy to clipboard'))
    expect(copy).toBeCalledTimes(1)
  })
})
