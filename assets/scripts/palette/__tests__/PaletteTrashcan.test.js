/* eslint-env jest */
import React from 'react'
import PaletteTrashcan from '../PaletteTrashcan'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'

describe('PaletteTrashcan', () => {
  it('renders when visible', () => {
    const { asFragment } = renderWithReduxAndIntl(<PaletteTrashcan />, {
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
    const { container } = renderWithReduxAndIntl(<PaletteTrashcan />, {
      initialState: {
        ui: {
          draggingState: null
        }
      }
    })

    expect(container.querySelector('.palette-trashcan-visible')).toBe(null)
  })
})
