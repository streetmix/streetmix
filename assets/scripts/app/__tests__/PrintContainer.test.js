/* eslint-env jest */
import React from 'react'
import { renderWithRedux } from '../../../../test/helpers/render'
import PrintContainer from '../PrintContainer'
import { screen } from '@testing-library/react'

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
    const { asFragment } = renderWithRedux(<PrintContainer />, {
      initialState: { app: { printing: false } }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders image for printing', () => {
    renderWithRedux(<PrintContainer />, {
      initialState: { app: { printing: true } }
    })

    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
