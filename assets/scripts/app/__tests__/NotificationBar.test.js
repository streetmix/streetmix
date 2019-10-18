/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithIntl } from '../../../../test/helpers/render'
import NotificationBar from '../NotificationBar'

const TEST_NOTIFICATION = {
  display: true,
  lede: 'Heads up!',
  text:
    'Streetmix will be offline for maintainance on January 1, 2025 at 19:00 GMT.',
  link: 'https://twitter.com/streetmix/',
  linkText: 'Follow us on Twitter for updates.'
}

describe('NotificationBar', () => {
  it('renders snapshot', () => {
    const wrapper = renderWithIntl(
      <NotificationBar locale="en" notification={TEST_NOTIFICATION} />
    )
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  describe('conditions that render something', () => {
    it('renders default link text if no link text is provided', () => {
      const notification = {
        display: true,
        link: TEST_NOTIFICATION.link
      }
      const wrapper = renderWithIntl(
        <NotificationBar locale="en" notification={notification} />
      )
      expect(wrapper.getByRole('link')).toHaveTextContent('More info')
    })
  })

  describe('conditions that render nothing', () => {
    it('renders nothing if notification is not provided', () => {
      const wrapper = renderWithIntl(<NotificationBar locale="en" />)
      expect(wrapper.container.firstChild).toBeNull()
    })

    it('renders nothing if notification is the empty object', () => {
      const wrapper = renderWithIntl(
        <NotificationBar locale="en" notification={{}} />
      )
      expect(wrapper.container.firstChild).toBeNull()
    })

    it('renders nothing if notification’s display property is false', () => {
      const notification = { ...TEST_NOTIFICATION, display: false }
      const wrapper = renderWithIntl(
        <NotificationBar locale="en" notification={notification} />
      )
      expect(wrapper.container.firstChild).toBeNull()
    })

    it('renders nothing if notification’s display property is true but has no other properties', () => {
      const notification = { display: true }
      const wrapper = renderWithIntl(
        <NotificationBar locale="en" notification={notification} />
      )
      expect(wrapper.container.firstChild).toBeNull()
    })

    it('renders nothing if the locale is not English', () => {
      const notification = { display: true }
      const wrapper = renderWithIntl(
        <NotificationBar locale="de" notification={notification} />
      )
      expect(wrapper.container.firstChild).toBeNull()
    })
  })

  describe('dismiss', () => {
    it('is no longer rendered after clicking the close button', () => {
      const wrapper = renderWithIntl(
        <NotificationBar locale="en" notification={TEST_NOTIFICATION} />
      )
      fireEvent.click(wrapper.getByTitle('Dismiss'))
      expect(wrapper.queryByText(TEST_NOTIFICATION.lede)).toBeNull()
    })
  })
})
