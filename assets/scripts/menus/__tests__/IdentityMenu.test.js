/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
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
  const initialState = {
    user: {
      signInData: {
        details: {
          id: 'foo',
          displayName: 'bar'
        }
      }
    }
  }

  it('renders', () => {
    const { asFragment } = render(<IdentityMenu isActive={true} />, {
      initialState
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('shows "My streets" when its link is clicked', async () => {
    render(<IdentityMenu isActive={true} />, { initialState })

    await userEvent.click(screen.getByText('My streets'))

    expect(openGallery).toBeCalledTimes(1)
    expect(openGallery).toBeCalledWith({ userId: 'foo' })
  })

  it('signs the user out when its link is clicked', async () => {
    render(<IdentityMenu isActive={true} />, { initialState })

    await userEvent.click(screen.getByText('Sign out'))

    expect(onSignOutClick).toBeCalledTimes(1)
  })
})
