/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import SignInDialog from '../SignInDialog'

jest.mock('../../app/routing', () => {
  return {
    goEmailSignIn: () => {}
  }
})

const email = 'omoyajowo@gmail.com'
const handleChange = {
  target: {name: 'email', value: email}
}

describe('SignInDialog', () => {
  it('it renders without crashing', () => {
    const wrapper = shallow(<SignInDialog closeDialog={jest.fn()} />)
    expect(wrapper.exists()).toEqual(true)
  })

  it('should change email state', () => {
    const wrapper = shallow(<SignInDialog closeDialog={jest.fn()} />)
    wrapper.find('[name="email"]').simulate('change', handleChange)
    expect(wrapper.state().email).toEqual(email)
  })
})
