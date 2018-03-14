/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import SettingsMenu from '../SettingsMenu'

describe('SettingsMenu', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<SettingsMenu />)
    expect(wrapper.find('div').length).toEqual(1)
  })
})
