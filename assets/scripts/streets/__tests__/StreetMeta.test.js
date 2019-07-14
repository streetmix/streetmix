/* eslint-env jest */
import React from 'react'
import StreetMeta from '../StreetMeta'
import { shallow } from 'enzyme'

jest.mock('../../streets/remix', () => {
  return {
    getRemixOnFirstEdit: () => {}
  }
})

jest.mock('../../app/load_resources', () => {})
jest.mock('../../app/initialization', () => {})
jest.mock('../../preinit/app_settings', () => {})

describe('StreetMeta', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<StreetMeta />)
    expect(wrapper.exists()).toEqual(true)
  })
})
