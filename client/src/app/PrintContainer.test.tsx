import { vi } from 'vitest'
import { screen } from '@testing-library/react'

import { render } from '~/test/helpers/render.js'
import { PrintContainer } from './PrintContainer.js'

vi.mock('../streets/image.js', () => ({
  getStreetImage: () => ({
    toDataURL: () => 'foo',
  }),
}))

describe('PrintContainer', () => {
  it('renders', () => {
    const { asFragment } = render(<PrintContainer />, {
      initialState: { app: { printing: false } },
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders image for printing', () => {
    render(<PrintContainer />, {
      initialState: { app: { printing: true } },
    })

    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
