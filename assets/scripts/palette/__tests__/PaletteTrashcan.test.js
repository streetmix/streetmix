/* eslint-env jest */
import React from 'react'
import { PaletteTrashcan } from '../PaletteTrashcan'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'

describe('PaletteTrashcan', () => {
  it('renders with the `-visible` class when `visible` prop is true', () => {
    const { asFragment, container } = renderWithReduxAndIntl(
      <PaletteTrashcan visible />
    )
    expect(asFragment()).toMatchSnapshot()
    expect(
      container.querySelectorAll('.palette-trashcan-visible').length
    ).toEqual(1)
  })

  it('doesn’t render with the `show` class when `visible` prop is false', () => {
    const { container } = renderWithReduxAndIntl(
      <PaletteTrashcan visible={false} />
    )
    expect(
      container.querySelectorAll('.palette-trashcan-visible').length
    ).toEqual(0)
  })
})
