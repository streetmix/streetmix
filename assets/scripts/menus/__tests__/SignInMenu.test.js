/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { SignInMenu } from '../SignInMenu'

jest.mock('../../app/routing', () => {
  return {
    goTwitterSignIn: () => {}
  }
})

describe('SignInMenu', () => {
  it('it renders without crashing', () => {
    const wrapper = shallow(<SignInMenu showDialog={jest.fn()} />)
    expect(wrapper.exists()).toEqual(true)
  })
})
