import React from 'react'

import { render } from '~/test/helpers/render'
import EmptySegmentContainer from '../EmptySegmentContainer'
import { TILE_SIZE } from '../constants'

describe('EmptySegment', () => {
  it('renders two <EmptySegment /> components of equal width', () => {
    const { getAllByText, container } = render(<EmptySegmentContainer />, {
      initialState: {
        street: {
          remainingWidth: 10,
          occupiedWidth: 40
        }
      }
    })

    expect(getAllByText(/empty space/i).length).toEqual(2)

    const firstComponentWidth = container.firstChild.style.width
    const lastComponentWidth = container.lastChild.style.width
    expect(firstComponentWidth).toEqual(lastComponentWidth)
  })

  it('renders one <EmptySegment /> component if street is totally empty', () => {
    const { getAllByText, container } = render(<EmptySegmentContainer />, {
      initialState: {
        street: {
          remainingWidth: 50,
          occupiedWidth: 0
        }
      }
    })

    expect(getAllByText(/empty space/i).length).toEqual(1)
    expect(container.firstChild.style.width).toEqual(`${50 * TILE_SIZE}px`)
  })

  it('renders zero <EmptySegment /> components if street is fully occupied', () => {
    const { container } = render(<EmptySegmentContainer />, {
      initialState: {
        street: {
          remainingWidth: 0,
          occupiedWidth: 50
        }
      }
    })

    expect(container.children.length).toEqual(0)
  })

  it('renders zero <EmptySegment /> components if street is over occupied', () => {
    const { container } = render(<EmptySegmentContainer />, {
      initialState: {
        street: {
          remainingWidth: -10,
          occupiedWidth: 50
        }
      }
    })

    expect(container.children.length).toEqual(0)
  })
})
