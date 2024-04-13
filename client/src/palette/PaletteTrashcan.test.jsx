import React from 'react'
import { screen } from '@testing-library/react'

import { render } from '~/test/helpers/render'
import PaletteTrashcan from './PaletteTrashcan'

describe('PaletteTrashcan', () => {
  it('renders when visible', () => {
    const { asFragment } = render(<PaletteTrashcan />, {
      initialState: {
        ui: {
          draggingState: {
            draggedSegment: 0
          }
        }
      }
    })

    expect(asFragment()).toMatchSnapshot()
  })

  it('doesn’t render when no segment is being dragged', () => {
    render(<PaletteTrashcan />, {
      initialState: {
        ui: {
          draggingState: null
        }
      }
    })

    expect(screen.getByText('Drag here to remove').hidden).toEqual(true)
  })
})
