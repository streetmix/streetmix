/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { mountWithIntl as mount } from '../../../../test/helpers/intl-enzyme-test-helper.js'
import { NoConnectionMessage } from '../NoConnectionMessage'
import { nonblockingAjaxTryAgain } from '../../util/fetch_nonblocking'

jest.mock('../../util/fetch_nonblocking', () => ({
  nonblockingAjaxTryAgain: jest.fn()
}))

describe('NoConnectionMessage', () => {
  it('renders a button', () => {
    const wrapper = shallow(<NoConnectionMessage />)
    expect(wrapper.find('button').length).toEqual(1)
  })

  it('tries to reconnect when button is clicked', () => {
    const wrapper = shallow(<NoConnectionMessage />)
    wrapper.find('button').simulate('click')
    expect(nonblockingAjaxTryAgain).toHaveBeenCalled()
  })

  it('does not have the visibility class when mounted', () => {
    const wrapper = shallow(<NoConnectionMessage />)
    expect(wrapper.find('.status-message-visible').length).toEqual(0)
  })

  it('applies visibility class when scheduled', () => {
    // Ensure that setTimouts will run automatically when triggered
    jest.useFakeTimers()

    // Mount, then change schedule the message to appear
    const wrapper = mount(<NoConnectionMessage />)
    wrapper.setProps({ scheduled: true })

    // Wait until component's componentDidUpdate() runs before checking visibility
    window.setTimeout(() => {
      jest.runAllTimers()
      expect(wrapper.find('.status-message-visible').length).toEqual(1)
    }, 0)
  })

  it.skip('removes visibility class when connectivity returns', () => {})
})
