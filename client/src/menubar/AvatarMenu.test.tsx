import React from 'react'
import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import { MOCK_USER } from '~/test/fixtures'
import AvatarMenu from './AvatarMenu'

describe('AvatarMenu', () => {
  it('renders user avatar', () => {
    const { asFragment } = render(
      <AvatarMenu user={MOCK_USER} isSubscriber={false} onClick={() => {}} />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders user avatar for subscriber', () => {
    const subscriber = {
      // Clone mock user
      ...MOCK_USER,
      // Add subscriber role
      roles: ['USER', 'SUBSCRIBER_1']
    }
    render(
      <AvatarMenu user={subscriber} isSubscriber={true} onClick={() => {}} />
    )
    expect(screen.queryByTitle('Streetmix+ member')).toBeInTheDocument()
  })

  it('calls click handler', async () => {
    const onClick = vi.fn()
    render(
      <AvatarMenu user={MOCK_USER} isSubscriber={false} onClick={onClick} />
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })
})
