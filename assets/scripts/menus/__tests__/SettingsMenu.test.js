/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { SettingsMenu } from '../SettingsMenu'

jest.mock('../../users/localization', () => {})

describe('SettingsMenu', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<SettingsMenu />)
    expect(wrapper.exists()).toEqual(true)
  })
})
