/* eslint-env jest */
import React from 'react'
import { EmptySegment } from '../EmptySegment'
import { TILE_SIZE } from '../../segments/constants'
import { SETTINGS_UNITS_METRIC } from '../../users/constants'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'

describe('EmptySegment', () => {
  it('renders nothing when the width is 0', () => {
    const wrapper = renderWithReduxAndIntl(<EmptySegment width={0} />)
    expect(wrapper.container.firstChild).toBeNull()
  })

  it('renders a width, and at left position 0 by default', () => {
    const wrapper = renderWithReduxAndIntl(
      <EmptySegment width={12.5} units={SETTINGS_UNITS_METRIC} locale="en" />
    )
    expect(
      wrapper.container.firstChild.classList.contains('segment-empty')
    ).toBeTruthy()
    expect(wrapper.container.firstChild.style.width).toEqual(
      `${12.5 * TILE_SIZE}px`
    )
    expect(wrapper.container.firstChild.style.left).toEqual('0px')
  })

  it('renders at width and left position given', () => {
    const wrapper = renderWithReduxAndIntl(
      <EmptySegment
        width={15}
        left={33}
        units={SETTINGS_UNITS_METRIC}
        locale="en"
      />
    )
    expect(
      wrapper.container.firstChild.classList.contains('segment-empty')
    ).toBeTruthy()
    expect(wrapper.container.firstChild.style.width).toEqual(
      `${15 * TILE_SIZE}px`
    )
    expect(wrapper.container.firstChild.style.left).toEqual(
      `${33 * TILE_SIZE}px`
    )
  })

  // TODO: unskip these tests when enzyme and react-test-render support memoized components
  it.skip('renders text content', () => {
    const wrapper = renderWithReduxAndIntl(
      <EmptySegment width={15} units={SETTINGS_UNITS_METRIC} locale="ja" />
    )
    expect(wrapper.container.firstChild.textContent).toBe('Empty space4.5 m')
  })
})
