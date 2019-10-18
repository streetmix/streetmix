/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithRedux } from '../../../../test/helpers/render'
import AvatarMenu from '../AvatarMenu'

const user = {
  id: 'foo'
}

describe('AvatarMenu', () => {
  it('renders user avatar', () => {
    const wrapper = renderWithRedux(<AvatarMenu user={user} />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders user avatar for admin', () => {
    const user = {
      id: 'foo',
      roles: ['ADMIN']
    }
    const wrapper = renderWithRedux(<AvatarMenu user={user} />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('calls click handler', () => {
    const onClick = jest.fn()
    const wrapper = renderWithRedux(
      <AvatarMenu user={user} onClick={onClick} />
    )
    fireEvent.click(wrapper.getByText(user.id))
    expect(onClick).toHaveBeenCalled()
  })
})
