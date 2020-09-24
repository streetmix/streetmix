/* eslint-env jest */
import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('displays tooltips on mouse hover', async () => {
    renderWithReduxAndIntl(<PaletteContainer />, {
      initialState: {
        app: {
          everythingLoaded: true
        }
      }
    })

    // Note: the tippyJS instance is actually on a child div of the listitem
    // element, because we are unable to wrap the <li> with <Tooltip> and then
    // send it to react-dnd. This limitation means we touch the implementation
    // in order to test hover on the correct element.
    userEvent.hover(screen.getAllByRole('listitem')[0].querySelector('div'))

    await waitFor(() => {
      expect(screen.getByText('Sidewalk')).toBeInTheDocument()
    })
  })
})
