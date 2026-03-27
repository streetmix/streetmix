import { vi } from 'vitest'

import { render } from '~/test/helpers/render.js'
import { AboutDialog } from './AboutDialog.js'

vi.mock('./credits.json', async () => await import('./__mocks__/credits.json'))

describe('AboutDialog', () => {
  it('renders snapshot', () => {
    const { asFragment } = render(<AboutDialog />)
    expect(asFragment()).toMatchSnapshot()
  })
})
