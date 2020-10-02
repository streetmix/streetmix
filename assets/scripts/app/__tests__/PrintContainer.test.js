/* eslint-env jest */
import React from 'react'
import { renderWithRedux } from '../../../../test/helpers/render'
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
    const { container } = renderWithRedux(<PrintContainer />, {
      initialState: { app: { printing: false } }
    })
    expect(container.querySelector('.print-container')).toBeInTheDocument()
  })

  it('renders image for printing', () => {
    const wrapper = renderWithRedux(<PrintContainer />, {
      initialState: { app: { printing: true } }
    })
    expect(wrapper.getByRole('img')).toBeInTheDocument()
  })
})
