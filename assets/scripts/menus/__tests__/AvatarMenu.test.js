/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import AvatarMenu from '../AvatarMenu'

const user = {
  id: 'foo'
}

describe('AvatarMenu', () => {
  it('renders user avatar', () => {
    const wrapper = shallow(<AvatarMenu user={user} />)
    expect(wrapper).toMatchSnapshot()
  })

  it('renders user avatar for admin', () => {
    const user = {
      id: 'foo',
      roles: ['ADMIN']
    }
    const wrapper = shallow(<AvatarMenu user={user} />)
    expect(wrapper.find('.menu-avatar-admin')).toHaveLength(1)
  })

  it('calls click handler', () => {
    const onClick = jest.fn()
    const wrapper = shallow(<AvatarMenu user={user} onClick={onClick} />)
    wrapper.find('button').simulate('click')
    expect(onClick).toHaveBeenCalled()
  })
})
