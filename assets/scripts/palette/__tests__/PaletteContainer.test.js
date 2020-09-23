/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import PaletteContainer from '../PaletteContainer'

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

    expect(container.firstChild).toBe(null)
  })

  it("doesn’t render items when sprites haven't loaded", () => {
    renderWithReduxAndIntl(<PaletteContainer />, {
      initialState: {
        app: {
          everythingLoaded: false
        }
      }
    })

    expect(screen.queryByRole('list')).toBe(null)
  })
})
