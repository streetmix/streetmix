/* eslint-env jest */
import React from 'react'
import NotificationBar from '../NotificationBar'
import { shallowWithIntl, mountWithIntl } from '../../../../test/helpers/intl-enzyme-test-helper.js'
import { mockIntl } from '../../../../test/__mocks__/react-intl'

const TEST_MESSAGE = {
  display: true,
  lede: 'Heads up!',
  text: 'Streetmix will be offline for maintainance on January 1, 2018 at 19:00 GMT.',
  link: 'https://twitter.com/streetmix/',
  linkText: 'Follow us on Twitter for updates.'
}

describe('NotificationBar', () => {
  it('renders without crashing', () => {
    const wrapper = shallowWithIntl(<NotificationBar intl={mockIntl} message={TEST_MESSAGE} />)
    expect(wrapper.exists()).toEqual(true)
  })

  describe('conditions that render nothing', () => {
    it('renders nothing if message is not provided', () => {
      const wrapper = mountWithIntl(<NotificationBar intl={mockIntl} />)
      expect(wrapper.html()).toEqual(null)
    })

    it('renders nothing if message is the empty object', () => {
      const wrapper = mountWithIntl(<NotificationBar intl={mockIntl} message={{}} />)
      expect(wrapper.html()).toEqual(null)
    })

    it('renders nothing if message’s display property is false', () => {
      const message = { ...TEST_MESSAGE, display: false }
      const wrapper = mountWithIntl(<NotificationBar intl={mockIntl} message={message} />)
      expect(wrapper.html()).toEqual(null)
    })

    it('renders nothing if message’s display property is true but has no other properties', () => {
      const message = { display: true }
      const wrapper = mountWithIntl(<NotificationBar intl={mockIntl} message={message} />)
      expect(wrapper.html()).toEqual(null)
    })
  })

  describe('conditions that render something', () => {
    it('renders an entire message', () => {
      const wrapper = mountWithIntl(<NotificationBar intl={mockIntl} message={TEST_MESSAGE} />)
      expect(wrapper.find('.notification-bar-intro').text()).toEqual(TEST_MESSAGE.lede)
      expect(wrapper.find('.notification-bar-text').text()).toEqual(TEST_MESSAGE.text)
      expect(wrapper.find('a').prop('href')).toEqual(TEST_MESSAGE.link)
      expect(wrapper.find('a').text()).toEqual(TEST_MESSAGE.linkText)
    })

    it('renders only the lede', () => {
      const message = {
        display: true,
        lede: TEST_MESSAGE.lede
      }
      const wrapper = mountWithIntl(<NotificationBar intl={mockIntl} message={message} />)
      expect(wrapper.find('.notification-bar-intro').text()).toEqual(message.lede)
      expect(wrapper.find('.notification-bar-text').exists()).toEqual(false)
      expect(wrapper.find('a').exists()).toEqual(false)
    })

    it('renders only the message text', () => {
      const message = {
        display: true,
        text: TEST_MESSAGE.text
      }
      const wrapper = mountWithIntl(<NotificationBar intl={mockIntl} message={message} />)
      expect(wrapper.find('.notification-bar-intro').exists()).toEqual(false)
      expect(wrapper.find('.notification-bar-text').text()).toEqual(message.text)
      expect(wrapper.find('a').exists()).toEqual(false)
    })

    it('renders only the link', () => {
      const message = {
        display: true,
        link: TEST_MESSAGE.link,
        linkText: TEST_MESSAGE.linkText
      }
      const wrapper = mountWithIntl(<NotificationBar intl={mockIntl} message={message} />)
      expect(wrapper.find('.notification-bar-intro').exists()).toEqual(false)
      expect(wrapper.find('.notification-bar-text').exists()).toEqual(false)
      expect(wrapper.find('a').prop('href')).toEqual(TEST_MESSAGE.link)
      expect(wrapper.find('a').text()).toEqual(TEST_MESSAGE.linkText)
    })

    it('renders placeholder link text', () => {
      const message = {
        display: true,
        link: TEST_MESSAGE.link
      }
      const wrapper = mountWithIntl(<NotificationBar intl={mockIntl} message={message} />)
      expect(wrapper.find('.notification-bar-intro').exists()).toEqual(false)
      expect(wrapper.find('.notification-bar-text').exists()).toEqual(false)
      expect(wrapper.find('a').prop('href')).toEqual(TEST_MESSAGE.link)
      expect(wrapper.find('a').text()).toEqual('More info')
    })

    it('renders the close button', () => {
      const wrapper = mountWithIntl(<NotificationBar intl={mockIntl} message={TEST_MESSAGE} />)
      expect(wrapper.find('.close').exists()).toEqual(true)
    })
  })

  describe('dismiss', () => {
    it.skip('handles clicking the close button', () => {
      // Apparently, you can't spy on a method declared as a class field property.
      // Ongoing discussion:
      // https://github.com/airbnb/enzyme/issues/365
      const spy = NotificationBar.prototype.onClickDismiss = jest.fn()
      const wrapper = mountWithIntl(<NotificationBar intl={mockIntl} message={TEST_MESSAGE} />)
      wrapper.find('.close').simulate('click')
      expect(spy).toHaveBeenCalled()
    })
  })
})
