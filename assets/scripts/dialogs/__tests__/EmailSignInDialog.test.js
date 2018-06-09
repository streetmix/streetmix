/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import EmailSignInDialog from '../EmailSignInDialog'

jest.mock('../../app/routing', () => {
  return {
    goEmailSignIn: () => {}
  }
})

const email = 'omoyajowo@gmail.com'
const handleChange = {
  target: {name: 'email', value: email}
}

describe('EmailSignInDialog', () => {
  it('it renders without crashing', () => {
    const wrapper = shallow(<EmailSignInDialog closeDialog={jest.fn()} />)
    expect(wrapper.exists()).toEqual(true)
  })

  it('should change email state', () => {
    const wrapper = shallow(<EmailSignInDialog closeDialog={jest.fn()} />)
    wrapper.find('[name="email"]').simulate('change', handleChange)
    expect(wrapper.state().email).toEqual(email)
  })
})
