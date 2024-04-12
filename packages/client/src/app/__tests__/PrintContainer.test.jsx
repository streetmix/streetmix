import React from 'react'
import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../../test/helpers/render'
import PrintContainer from '../PrintContainer'

vi.mock('../../streets/image', () => ({
  getStreetImage: () => ({
    toDataURL: () => 'foo'
  })
}))

describe('PrintContainer', () => {
  it('renders', () => {
    const { asFragment } = render(<PrintContainer />, {
      initialState: { app: { printing: false } }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders image for printing', () => {
    render(<PrintContainer />, {
      initialState: { app: { printing: true } }
    })

    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
