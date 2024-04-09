import React from 'react'
import EmptySegment from '../EmptySegment'
import { TILE_SIZE } from '../constants'
import { SETTINGS_UNITS_METRIC } from '../../users/constants'
import { render } from '../../../../test/helpers/render'

describe('EmptySegment', () => {
  const initialState = {
    street: { units: SETTINGS_UNITS_METRIC },
    locale: { locale: 'en' }
  }

  it('renders nothing when the width is 0', () => {
    const { container } = render(<EmptySegment width={0} left={0} />, {
      initialState
    })

    expect(container.firstChild).toBeNull()
  })

  it('renders a width, and at left position 0', () => {
    const { container } = render(<EmptySegment width={3.75} left={0} />, {
      initialState
    })

    const el = container.firstChild
    expect(el.classList.contains('segment-empty')).toBeTruthy()
    expect(el.style.width).toEqual(`${3.75 * TILE_SIZE}px`)
    expect(el.style.left).toEqual('0px')
  })

  it('renders at width and left position given', () => {
    const { container } = render(<EmptySegment width={4.5} left={10} />, {
      initialState
    })

    const el = container.firstChild
    expect(el.classList.contains('segment-empty')).toBeTruthy()
    expect(el.style.width).toEqual(`${4.5 * TILE_SIZE}px`)
    expect(el.style.left).toEqual(`${10 * TILE_SIZE}px`)
  })

  it('renders text content', () => {
    const { getByText } = render(<EmptySegment width={4.5} />, {
      initialState
    })

    expect(getByText('4.5 m')).toBeInTheDocument()
    expect(getByText('Empty space')).toBeInTheDocument()
  })
})
