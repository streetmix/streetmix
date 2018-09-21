/* eslint-env jest */
import React from 'react'
import { shallowWithIntl } from '../../../../test/helpers/intl-enzyme-test-helper.js'
import { HelpMenuWithIntl as HelpMenu } from '../HelpMenu'

describe('HelpMenu', () => {
  it('renders without crashing', () => {
    const wrapper = shallowWithIntl(<HelpMenu showDialog={jest.fn()} />).dive()
    expect(wrapper.find('div').length).toEqual(1)
  })

  it('shows the About dialog when its link is clicked', () => {
    const showDialog = jest.fn()
    const wrapper = shallowWithIntl(<HelpMenu showAboutDialog={showDialog} />).dive()
    wrapper.find('a').first().simulate('click')
    expect(showDialog).toBeCalled()
  })

  it('shows the What’s New dialog when its link is clicked', () => {
    const showDialog = jest.fn()
    const wrapper = shallowWithIntl(<HelpMenu showWhatsNewDialog={showDialog} />).dive()
    wrapper.find('a').last().simulate('click')
    expect(showDialog).toBeCalled()
  })

  // To implement this test, we need to test that the `keydown`
  // event is listened to on the window. It's possible this is out
  // of scope for a unit test and should be captured in the
  // end-to-end acceptance testing instead.
  it('shows the About dialog when keyboard shortcut is pressed', () => {})
})
