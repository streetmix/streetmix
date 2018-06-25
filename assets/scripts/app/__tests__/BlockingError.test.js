/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { BlockingError } from '../BlockingError'
import { ERRORS } from '../errors'

jest.mock('../routing', () => ({
  goReload: () => {},
  goHome: () => {},
  goNewStreet: () => {},
  goExampleStreet: () => {},
  goTwitterSignIn: () => {}
}))
jest.mock('../load_resources', () => {})
jest.mock('../../users/authentication', () => {})

describe('BlockingError', () => {
  it('renders', () => {
    const wrapper = shallow(<BlockingError errorType={ERRORS.NOT_FOUND} street={{}} />)
    expect(wrapper.exists()).toEqual(true)
  })
})
