/* eslint-env jest */
import React from 'react'
import SettingsMenu from '../SettingsMenu'
import { shallow } from 'enzyme'

describe('SettingsMenu', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<SettingsMenu />)
    expect(wrapper.find('div').length).toEqual(1)
  })
})
