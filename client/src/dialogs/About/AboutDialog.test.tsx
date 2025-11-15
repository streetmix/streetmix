import React from 'react'
import { vi } from 'vitest'

import { render } from '~/test/helpers/render'
import AboutDialog from './AboutDialog'

vi.mock('./credits.json', async () => await import('./__mocks__/credits.json'))

describe('AboutDialog', () => {
  it('renders snapshot', () => {
    const { asFragment } = render(<AboutDialog />)
    expect(asFragment()).toMatchSnapshot()
  })
})
