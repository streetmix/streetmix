/* eslint-env jest */
import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
import PaletteContainer from '../PaletteContainer'

jest.mock('../../segments/view', () => {
  const actual = jest.requireActual('../../segments/view')
  return {
    ...actual,
    drawSegmentContents: jest.fn()
  }
})
jest.mock('../../segments/segment-lookup.json', () =>
  require('../../segments/__mocks__/segment-lookup.json')
)

describe('PaletteContainer', () => {
  it('renders', () => {
    const { asFragment } = render(<PaletteContainer />, {
      initialState: {
        app: {
          everythingLoaded: true
        },
        flags: {
          // For SegmentForPalette
          DEBUG_SEGMENT_CANVAS_RECTANGLES: { value: false },
          // Tests flag filter + unlock condition
          SEGMENT_CAFE_SEATING: { value: true }
        }
      }
    })

    expect(asFragment()).toMatchSnapshot()
  })

  it('doesn’t render in read-only mode', () => {
    const { container } = render(<PaletteContainer />, {
      initialState: {
        app: {
          readOnly: true
        }
      }
    })

    expect(container.firstChild).toBe(null)
  })

  it("doesn’t render items when sprites haven't loaded", () => {
    render(<PaletteContainer />, {
      initialState: {
        app: {
          everythingLoaded: false
        }
      }
    })

    expect(screen.queryByRole('list')).toBe(null)
  })

  it('displays tooltips on mouse hover', async () => {
    render(<PaletteContainer />, {
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
    await userEvent.hover(
      screen.getAllByRole('listitem')[0].querySelector('div')
    )

    await waitFor(() => {
      expect(screen.getByText('Sidewalk')).toBeInTheDocument()
    })
  })
})
