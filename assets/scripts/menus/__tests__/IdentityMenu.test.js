/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { IdentityMenu } from '../IdentityMenu'

jest.mock('../../users/authentication', () => {
  return {
    onSignOutClick: () => {}
  }
})
jest.mock('../../gallery/view', () => {
  return {
    showGallery: () => {}
  }
})

describe('IdentityMenu', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<IdentityMenu />)
    expect(wrapper.exists()).toEqual(true)
  })
})
