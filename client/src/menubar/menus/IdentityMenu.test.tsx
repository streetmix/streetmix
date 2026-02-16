import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render.js'
import { openGallery } from '~/src/store/actions/gallery.js'
import { signOut } from '~/src/users/authentication.js'
import { IdentityMenu } from './IdentityMenu.js'

vi.mock('../../store/actions/gallery.js', () => ({
  openGallery: vi.fn((_id) => ({ type: 'MOCK_ACTION' })),
}))
vi.mock('../../users/authentication.js', () => ({
  signOut: vi.fn(),
}))

describe('IdentityMenu', () => {
  const initialState = {
    user: {
      signInData: {
        details: {
          id: 'foo',
          displayName: 'bar',
        },
      },
    },
  }

  it('renders', () => {
    const { asFragment } = render(<IdentityMenu isActive />, {
      initialState,
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

    expect(signOut).toBeCalledTimes(1)
  })
})
