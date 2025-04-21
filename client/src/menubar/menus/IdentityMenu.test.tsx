import React from 'react'
import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import { openGallery } from '~/src/store/actions/gallery'
import { onSignOutClick } from '~/src/users/authentication'
import IdentityMenu from './IdentityMenu'

vi.mock('../../store/actions/gallery', () => ({
  openGallery: vi.fn((id) => ({ type: 'MOCK_ACTION' }))
}))
vi.mock('../../users/authentication', () => ({
  onSignOutClick: vi.fn()
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
    const { asFragment } = render(<IdentityMenu isActive />, {
      initialState
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('shows "My streets" when its link is clicked', async () => {
    render(<IdentityMenu isActive />, { initialState })

    await userEvent.click(screen.getByText('My streets'))

    expect(openGallery).toBeCalledTimes(1)
    expect(openGallery).toBeCalledWith({ userId: 'foo' })
  })

  it('signs the user out when its link is clicked', async () => {
    render(<IdentityMenu isActive />, { initialState })

    await userEvent.click(screen.getByText('Sign out'))

    expect(onSignOutClick).toBeCalledTimes(1)
  })
})
