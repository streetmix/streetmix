/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import PaletteTrashcan from '../PaletteTrashcan'

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
    renderWithReduxAndIntl(<PaletteTrashcan />, {
      initialState: {
        ui: {
          draggingState: null
        }
      }
    })

    expect(screen.getByText('Drag here to remove').hidden).toEqual(true)
  })
})
