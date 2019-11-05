/* eslint-env jest */
import React from 'react'
import PaletteTooltips from '../PaletteTooltips'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'

describe('PaletteTooltips', () => {
  it('renders with the `show` class when `visible` prop is true', () => {
    const { container } = renderWithReduxAndIntl(<PaletteTooltips visible />)
    expect(container.querySelectorAll('.palette-tooltip-show').length).toEqual(
      1
    )
  })

  it('doesn’t render with the `show` class when `visible` prop is false', () => {
    const { container } = renderWithReduxAndIntl(
      <PaletteTooltips visible={false} />
    )
    expect(container.querySelectorAll('.palette-tooltip-show').length).toEqual(
      0
    )
  })

  it('renders the label', () => {
    const { getByText } = renderWithReduxAndIntl(
      <PaletteTooltips visible label="foo" />
    )
    expect(getByText('foo')).toBeDefined()
  })

  it.todo('displays in the correct location')
})
