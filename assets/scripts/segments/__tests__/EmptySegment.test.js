/* eslint-env jest */
import React from 'react'
import EmptySegment from '../EmptySegment'
import { TILE_SIZE } from '../../segments/constants'
import { SETTINGS_UNITS_METRIC } from '../../users/constants'
import { render } from '../../../../test/helpers/render'

describe('EmptySegment', () => {
  const initialState = {
    street: { units: SETTINGS_UNITS_METRIC },
    locale: { locale: 'en' }
  }

  it('renders nothing when the width is 0', () => {
    const { container } = render(<EmptySegment width={0} />, {
      initialState
    })

    expect(container.firstChild).toBeNull()
  })

  it('renders a width, and at left position 0 by default', () => {
    const { container } = render(<EmptySegment width={12.5} />, {
      initialState
    })

    const el = container.firstChild
    expect(el.classList.contains('segment-empty')).toBeTruthy()
    expect(el.style.width).toEqual(`${12.5 * TILE_SIZE}px`)
    expect(el.style.left).toEqual('0px')
  })

  it('renders at width and left position given', () => {
    const { container } = render(<EmptySegment width={15} left={33} />, {
      initialState
    })

    const el = container.firstChild
    expect(el.classList.contains('segment-empty')).toBeTruthy()
    expect(el.style.width).toEqual(`${15 * TILE_SIZE}px`)
    expect(el.style.left).toEqual(`${33 * TILE_SIZE}px`)
  })

  it('renders text content', () => {
    const { getByText } = render(<EmptySegment width={15} />, {
      initialState
    })

    expect(getByText('4.5 m')).toBeInTheDocument()
    expect(getByText('Empty space')).toBeInTheDocument()
  })
})
