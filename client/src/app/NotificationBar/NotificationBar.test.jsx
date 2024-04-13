import React from 'react'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import NotificationBar from './NotificationBar'

const TEST_NOTIFICATION = {
  display: true,
  lede: 'Heads up!',
  text: 'Streetmix will be offline for maintainance on January 1, 2025 at 19:00 GMT.',
  link: 'https://twitter.com/streetmix/',
  linkText: 'Follow us on Twitter for updates.'
}

const initialState = {
  locale: {
    locale: 'en'
  }
}

describe('NotificationBar', () => {
  it('renders snapshot', () => {
    const { asFragment } = render(
      <NotificationBar notification={TEST_NOTIFICATION} />,
      { initialState }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  describe('conditions that render something', () => {
    it('renders default link text if no link text is provided', () => {
      const notification = {
        display: true,
        link: TEST_NOTIFICATION.link
      }
      render(<NotificationBar notification={notification} />, {
        initialState
      })
      expect(screen.getByRole('link')).toHaveTextContent('More info')
    })
  })

  describe('conditions that render nothing', () => {
    it('renders nothing if notification is not provided', () => {
      const { container } = render(<NotificationBar />, {
        initialState
      })
      expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing if notification is the empty object', () => {
      const { container } = render(<NotificationBar notification={{}} />)
      expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing if notification’s display property is false', () => {
      const notification = { ...TEST_NOTIFICATION, display: false }
      const { container } = render(
        <NotificationBar notification={notification} />,
        { initialState }
      )
      expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing if notification’s display property is true but has no other properties', () => {
      const notification = { display: true }
      const { container } = render(
        <NotificationBar notification={notification} />,
        { initialState }
      )
      expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing if the locale is not English', () => {
      const notification = { display: true }
      const { container } = render(
        <NotificationBar locale="de" notification={notification} />,
        { initialState }
      )
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('dismiss', () => {
    it('is no longer rendered after clicking the close button', async () => {
      render(<NotificationBar notification={TEST_NOTIFICATION} />, {
        initialState
      })
      await userEvent.click(screen.getByTitle('Dismiss'))
      expect(screen.queryByText(TEST_NOTIFICATION.lede)).toBeNull()
    })
  })
})
