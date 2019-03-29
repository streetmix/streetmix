/* eslint-env jest */
import React from 'react'
import NotificationBar from '../NotificationBar'
import { shallowWithIntl, mountWithIntl } from '../../../../test/helpers/intl-enzyme-test-helper.js'

const TEST_NOTIFICATION = {
  display: true,
  lede: 'Heads up!',
  text: 'Streetmix will be offline for maintainance on January 1, 2018 at 19:00 GMT.',
  link: 'https://twitter.com/streetmix/',
  linkText: 'Follow us on Twitter for updates.'
}

describe('NotificationBar', () => {
  it('renders without crashing', () => {
    const wrapper = shallowWithIntl(<NotificationBar locale="en" notification={TEST_NOTIFICATION} />)
    expect(wrapper.exists()).toEqual(true)
  })

  describe('conditions that render nothing', () => {
    it('renders nothing if notification is not provided', () => {
      const wrapper = mountWithIntl(<NotificationBar locale="en" />)
      expect(wrapper.html()).toEqual(null)
    })

    it('renders nothing if notification is the empty object', () => {
      const wrapper = mountWithIntl(<NotificationBar locale="en" notification={{}} />)
      expect(wrapper.html()).toEqual(null)
    })

    it('renders nothing if notification’s display property is false', () => {
      const notification = { ...TEST_NOTIFICATION, display: false }
      const wrapper = mountWithIntl(<NotificationBar locale="en" notification={notification} />)
      expect(wrapper.html()).toEqual(null)
    })

    it('renders nothing if notification’s display property is true but has no other properties', () => {
      const notification = { display: true }
      const wrapper = mountWithIntl(<NotificationBar locale="en" notification={notification} />)
      expect(wrapper.html()).toEqual(null)
    })

    it('renders nothing if the locale is not English', () => {
      const notification = { display: true }
      const wrapper = mountWithIntl(<NotificationBar locale="de" notification={notification} />)
      expect(wrapper.html()).toEqual(null)
    })
  })

  describe('conditions that render something', () => {
    it('renders an entire notification', () => {
      const wrapper = mountWithIntl(<NotificationBar locale="en" notification={TEST_NOTIFICATION} />)
      expect(wrapper.find('.notification-bar-intro').text()).toEqual(TEST_NOTIFICATION.lede)
      expect(wrapper.find('.notification-bar-text').text()).toEqual(TEST_NOTIFICATION.text)
      expect(wrapper.find('a').prop('href')).toEqual(TEST_NOTIFICATION.link)
      expect(wrapper.find('a').text()).toEqual(TEST_NOTIFICATION.linkText)
    })

    it('renders only the lede', () => {
      const notification = {
        display: true,
        lede: TEST_NOTIFICATION.lede
      }
      const wrapper = mountWithIntl(<NotificationBar locale="en" notification={notification} />)
      expect(wrapper.find('.notification-bar-intro').text()).toEqual(notification.lede)
      expect(wrapper.find('.notification-bar-text').exists()).toEqual(false)
      expect(wrapper.find('a').exists()).toEqual(false)
    })

    it('renders only the notification text', () => {
      const notification = {
        display: true,
        text: TEST_NOTIFICATION.text
      }
      const wrapper = mountWithIntl(<NotificationBar locale="en" notification={notification} />)
      expect(wrapper.find('.notification-bar-intro').exists()).toEqual(false)
      expect(wrapper.find('.notification-bar-text').text()).toEqual(notification.text)
      expect(wrapper.find('a').exists()).toEqual(false)
    })

    it('renders only the link', () => {
      const notification = {
        display: true,
        link: TEST_NOTIFICATION.link,
        linkText: TEST_NOTIFICATION.linkText
      }
      const wrapper = mountWithIntl(<NotificationBar locale="en" notification={notification} />)
      expect(wrapper.find('.notification-bar-intro').exists()).toEqual(false)
      expect(wrapper.find('.notification-bar-text').exists()).toEqual(false)
      expect(wrapper.find('a').prop('href')).toEqual(TEST_NOTIFICATION.link)
      expect(wrapper.find('a').text()).toEqual(TEST_NOTIFICATION.linkText)
    })

    it('renders placeholder link text', () => {
      const notification = {
        display: true,
        link: TEST_NOTIFICATION.link
      }
      const wrapper = mountWithIntl(<NotificationBar locale="en" notification={notification} />)
      expect(wrapper.find('.notification-bar-intro').exists()).toEqual(false)
      expect(wrapper.find('.notification-bar-text').exists()).toEqual(false)
      expect(wrapper.find('a').prop('href')).toEqual(TEST_NOTIFICATION.link)
      expect(wrapper.find('a').text()).toEqual('More info')
    })

    it('renders the close button', () => {
      const wrapper = mountWithIntl(<NotificationBar locale="en" notification={TEST_NOTIFICATION} />)
      expect(wrapper.find('.close').exists()).toEqual(true)
    })
  })

  describe('dismiss', () => {
    it.skip('handles clicking the close button', () => {
      // Apparently, you can't spy on a method declared as a class field property.
      // Ongoing discussion:
      // https://github.com/airbnb/enzyme/issues/365
      const spy = NotificationBar.prototype.onClickDismiss = jest.fn()
      const wrapper = mountWithIntl(<NotificationBar locale="en" notification={TEST_NOTIFICATION} />)
      wrapper.find('.close').simulate('click')
      expect(spy).toHaveBeenCalled()
    })
  })
})
