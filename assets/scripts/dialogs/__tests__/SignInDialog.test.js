/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { SignInDialog } from '../SignInDialog'

jest.mock('../../app/routing', () => {
  return {
    goEmailSignIn: () => {}
  }
})

describe('SignInDialog', () => {
  it('it renders without crashing', () => {
    const wrapper = shallow(<SignInDialog closeDialog={jest.fn()} />)
    expect(wrapper.exists()).toEqual(true)
  })
})
