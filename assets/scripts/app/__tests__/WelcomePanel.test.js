/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { WelcomePanel } from '../WelcomePanel'

jest.mock('../mode', () => {})
jest.mock('../../segments/view', () => {})
jest.mock('../../streets/creation', () => {})
jest.mock('../../streets/data_model', () => {})
jest.mock('../../users/authentication', () => {})

describe('WelcomePanel', () => {
  // Note: this test will always pass because of how this component's lifecycle works
  it('does not show if app is read-only', () => {
    const wrapper = shallow(<WelcomePanel readOnly />)
    expect(wrapper.state().visible).toBe(false)
  })
})
