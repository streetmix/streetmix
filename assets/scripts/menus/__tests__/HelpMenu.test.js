/* eslint-env jest */
import React from 'react'
import { HelpMenu } from '../HelpMenu'
import { shallow } from 'enzyme'

describe('HelpMenu', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<HelpMenu showDialog={jest.fn()} />)
    expect(wrapper.find('div').length).toEqual(1)
  })

  it('shows the About dialog when its link is clicked', () => {
    const showDialog = jest.fn()
    const wrapper = shallow(<HelpMenu showDialog={showDialog} />)
    wrapper.find('a').simulate('click')
    expect(showDialog).toBeCalled()
  })

  // To implement this test, we need to test that the `keydown`
  // event is listened to on the window. It's possible this is out
  // of scope for a unit test and should be captured in the
  // end-to-end acceptance testing instead.
  it('shows the About dialog when keyboard shortcut is pressed')
})
