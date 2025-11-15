import React from 'react'
import { waitFor } from '@testing-library/react'

import { render } from '~/test/helpers/render'
import Avatar from './Avatar'

describe('Avatar', () => {
  it('shows avatar image', async () => {
    const userId = 'foo'

    const { getByAltText } = render(<Avatar userId={userId} />)

    await waitFor(() => {
      const el = getByAltText(userId) as HTMLImageElement

      // Expect image element to have a URL string of any length
      expect(el.src.length).toBeGreaterThan(1)
    })
  })
})
