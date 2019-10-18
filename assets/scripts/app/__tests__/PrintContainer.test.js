/* eslint-env jest */
import React from 'react'
import { cleanup } from '@testing-library/react'
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
    const wrapper = renderWithRedux(<PrintContainer />, { initialState: { app: { printing: false } } })
    const el = wrapper.container.querySelector('.print-container')
    expect(el).toBeInTheDocument()
  })

  it('renders image for printing', () => {
    const wrapper = renderWithRedux(<PrintContainer />, { initialState: { app: { printing: true } } })
    expect(wrapper.getByRole('img')).toBeInTheDocument()
  })
})
