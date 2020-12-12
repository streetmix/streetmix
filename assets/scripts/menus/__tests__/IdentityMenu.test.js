/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import IdentityMenu from '../IdentityMenu'
import { openGallery } from '../../store/actions/gallery'
import { onSignOutClick } from '../../users/authentication'

jest.mock('../../store/actions/gallery', () => ({
  openGallery: jest.fn((id) => ({ type: 'MOCK_ACTION' }))
}))
jest.mock('../../users/authentication', () => ({
  onSignOutClick: jest.fn()
}))

describe('IdentityMenu', () => {
  it('renders', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <IdentityMenu isActive={true} />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('shows "My streets" when its link is clicked', () => {
    renderWithReduxAndIntl(<IdentityMenu isActive={true} />, {
      initialState: {
        user: {
          signInData: {
            userId: 'foo'
          }
        }
      }
    })

    userEvent.click(screen.getByText('My streets'))

    expect(openGallery).toBeCalledTimes(1)
    expect(openGallery).toBeCalledWith({ userId: 'foo' })
  })

  it('signs the user out when its link is clicked', () => {
    renderWithReduxAndIntl(<IdentityMenu isActive={true} />)

    userEvent.click(screen.getByText('Sign out'))

    expect(onSignOutClick).toBeCalledTimes(1)
  })
})
