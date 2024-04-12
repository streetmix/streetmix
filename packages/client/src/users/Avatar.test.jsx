import React from 'react'
import { waitFor } from '@testing-library/react'
import { render } from '../test/helpers/render'
import Avatar from './Avatar'

describe('Avatar', () => {
  it('shows avatar image', async () => {
    const userId = 'foo'

    const { getByAltText } = render(<Avatar userId={userId} />)

    await waitFor(() => {
      const el = getByAltText(userId)

      // Expect image element to have a URL string of any length
      expect(el.src.length).toBeGreaterThan(1)
    })
  })

  it('handles loading state', () => {
    const userId = 'foo'
    const { getByAltText } = render(<Avatar userId={userId} />)

    const el = getByAltText(userId)

    // This test doesn't need to `waitFor` anything because the default
    // state of `useGetUserQuery` is start in loading mode.
    // Expect image element to have empty `src`
    expect(el.src).toEqual('')
  })

  it('shows a placeholder image if the avatar image fails to fetch', async () => {
    // This user id will trigger an error response from the msw handler
    const userId = 'error_user'
    const { getByAltText } = render(<Avatar userId={userId} />)

    await waitFor(() => {
      const el = getByAltText(userId)

      // Expect image element to have empty `src`
      expect(el.src).toEqual('')
    })
  })
})
