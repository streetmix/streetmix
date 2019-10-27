/* eslint-env jest */
import React from 'react'
import { EmptySegment } from '../EmptySegment'
import { TILE_SIZE } from '../../segments/constants'
import { SETTINGS_UNITS_METRIC } from '../../users/constants'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'

describe('EmptySegment', () => {
  it('renders nothing when the width is 0', () => {
    const { container } = renderWithReduxAndIntl(<EmptySegment width={0} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a width, and at left position 0 by default', () => {
    const { container } = renderWithReduxAndIntl(
      <EmptySegment width={12.5} units={SETTINGS_UNITS_METRIC} locale="en" />
    )
    expect(
      container.firstChild.classList.contains('segment-empty')
    ).toBeTruthy()
    expect(container.firstChild.style.width).toEqual(`${12.5 * TILE_SIZE}px`)
    expect(container.firstChild.style.left).toEqual('0px')
  })

  it('renders at width and left position given', () => {
    const { container } = renderWithReduxAndIntl(
      <EmptySegment
        width={15}
        left={33}
        units={SETTINGS_UNITS_METRIC}
        locale="en"
      />
    )
    expect(
      container.firstChild.classList.contains('segment-empty')
    ).toBeTruthy()
    expect(container.firstChild.style.width).toEqual(`${15 * TILE_SIZE}px`)
    expect(container.firstChild.style.left).toEqual(`${33 * TILE_SIZE}px`)
  })

  it('renders text content', () => {
    const { container } = renderWithReduxAndIntl(
      <EmptySegment width={15} units={SETTINGS_UNITS_METRIC} locale="ja" />
    )
    expect(container.firstChild.textContent).toBe('Empty space4.5 m')
  })
})
