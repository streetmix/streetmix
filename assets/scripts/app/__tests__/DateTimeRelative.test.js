/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { advanceTo, clear } from 'jest-date-mock'
import { mountWithIntl } from '../../../../test/helpers/intl-enzyme-test-helper.js'
import DateTimeRelative from '../DateTimeRelative'

// This will only test `en-US` (default) values. Assume that localized values will
// be handled accurately by the react-intl implementation.

describe('DateTimeRelative', () => {
  // Mock global Date object so that Date.now() returns the value we specify
  beforeAll(() => {
    advanceTo(new Date(1524506400000)) // '2018-04-23T18:00:00.000Z'
  })

  it('renders without crashing', () => {
    const wrapper = shallow(<DateTimeRelative value={new Date().toISOString()} />)
    expect(wrapper.exists()).toEqual(true)
  })

  it('renders "seconds ago" string', () => {
    const wrapper = mountWithIntl(<DateTimeRelative value={'2018-04-23T17:59:01.000Z'} />)
    expect(wrapper.text()).toEqual('A few seconds ago')
  })

  it('renders "minutes ago" string', () => {
    const wrapper = mountWithIntl(<DateTimeRelative value={'2018-04-23T17:50:01.000Z'} />)
    expect(wrapper.text()).toEqual('A few minutes ago')
  })

  it('renders "today at {time}" string', () => {
    // Pass in timezone as UTC to force it not to use server's time zone
    const wrapper = mountWithIntl(<DateTimeRelative value={'2018-04-23T12:00:00.000Z'} timezone="UTC" />)
    expect(wrapper.text()).toEqual('Today at 12:00 PM')
  })

  it('renders "yesterday at {time}" string', () => {
    // Pass in timezone as UTC to force it not to use server's time zone
    const wrapper = mountWithIntl(<DateTimeRelative value={'2018-04-22T06:00:00.000Z'} timezone="UTC" />)
    expect(wrapper.text()).toEqual('Yesterday at 6:00 AM')
  })

  it('renders a date that happened this year', () => {
    const wrapper = mountWithIntl(<DateTimeRelative value={'2018-02-03T18:00:00.000Z'} />)
    expect(wrapper.text()).toEqual('February 3')
  })

  it('renders a date in another year', () => {
    const wrapper = mountWithIntl(<DateTimeRelative value={'2017-10-17T18:00:00.000Z'} />)
    expect(wrapper.text()).toEqual('October 17, 2017')
  })

  afterAll(() => {
    // Restore the implementation of global Date object
    clear()
  })
})
