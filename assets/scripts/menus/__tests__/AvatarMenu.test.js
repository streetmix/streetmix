/* eslint-env jest */
import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithRedux } from '../../../../test/helpers/render'
import AvatarMenu from '../AvatarMenu'

const user = {
  id: 'foo'
}

describe('AvatarMenu', () => {
  it('renders user avatar', () => {
    const { asFragment } = renderWithRedux(<AvatarMenu user={user} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders user avatar for admin', () => {
    const user = {
      id: 'foo',
      roles: ['ADMIN']
    }
    const { asFragment } = renderWithRedux(<AvatarMenu user={user} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('calls click handler', () => {
    const onClick = jest.fn()
    renderWithRedux(<AvatarMenu user={user} onClick={onClick} />)
    fireEvent.click(screen.getByText(user.id))
    expect(onClick).toHaveBeenCalled()
  })
})
