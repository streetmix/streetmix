import React from 'react'
import { vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import PaletteContainer from './PaletteContainer'

vi.mock('../segments/view', async (importOriginal) => {
  const actual: object = await importOriginal()
  return {
    ...actual,
    drawSegmentContents: vi.fn()
  }
})
// TODO: different way of mocking this...?
vi.mock(
  '@streetmix/parts/build/segment-lookup.json',
  async () => await import('@streetmix/parts/src/__mocks__/segment-lookup.json')
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

    // The tooltip is on the child (<button>) element of the list item
    await userEvent.hover(
      screen.getAllByRole('listitem')[0].querySelector('button') as Element
    )

    await waitFor(() => {
      expect(screen.getByText('Sidewalk')).toBeInTheDocument()
    })
  })
})
