/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import { render } from '../../../../test/helpers/render'
import PrintContainer from '../PrintContainer'

// `matchMedia` is not available in test environment, so we mock it
global.matchMedia = () => ({
  addListener: () => {},
  removeListener: () => {}
})

jest.mock('../../streets/image', () => ({
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
