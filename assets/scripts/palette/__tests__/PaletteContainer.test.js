/* eslint-env jest */
import React from 'react'
import PaletteContainer from '../PaletteContainer'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'

jest.mock('../../segments/view', () => {
  const actual = jest.requireActual('../../segments/view')
  return {
    ...actual,
    drawSegmentContents: jest.fn()
  }
})

describe('PaletteContainer', () => {
  it('renders', () => {
    const { asFragment } = renderWithReduxAndIntl(<PaletteContainer />, {
      initialState: {
        app: {
          everythingLoaded: true
        },
        // Assume the environment editor is enabled. This will render
        // the <EnvironmentEditor /> button for test coverage.
        flags: {
          ENVIRONMENT_EDITOR: { value: true },
          DEBUG_SEGMENT_CANVAS_RECTANGLES: { value: false } // for SegmentForPalette
        }
      }
    })

    expect(asFragment()).toMatchSnapshot()
  })

  it('doesn’t render in read-only mode', () => {
    const { container } = renderWithReduxAndIntl(<PaletteContainer />, {
      initialState: {
        app: {
          readOnly: true
        }
      }
    })

    expect(container.querySelector('.palette-container')).toBe(null)
  })

  it("doesn’t render items when sprites haven't loaded", () => {
    const { container } = renderWithReduxAndIntl(<PaletteContainer />, {
      initialState: {
        app: {
          everythingLoaded: false
        }
      }
    })

    expect(container.querySelector('.palette-items')).toBe(null)
  })
})
