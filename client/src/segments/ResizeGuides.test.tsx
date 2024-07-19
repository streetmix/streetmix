import React from 'react'
import { vi, type Mock } from 'vitest'

import { render } from '~/test/helpers/render'
import ResizeGuides from './ResizeGuides'
import { TILE_SIZE } from './constants'
import { getSegmentVariantInfo } from './info'

vi.mock('./view', () => ({
  // Function returns a mock element with properties we need to read
  getSegmentEl: () => ({
    offsetLeft: 50,
    offsetWidth: 50
  })
}))

vi.mock('../util/helpers', () => ({
  // Returns mock position information
  getElRelativePos: () => [50, 0]
}))

vi.mock('./info', () => ({
  // Function returns mock segment variant info of nothing
  // Specific tests can use `mockImplementation` to make it return other info
  getSegmentVariantInfo: vi.fn(() => ({}))
}))

const initialState = {
  ui: {
    resizeGuidesVisible: true,
    activeSegment: 0
  },
  street: {
    segments: [{}],
    remainingWidth: 0,
    units: 0
  }
}

describe('ResizeGuides', () => {
  it('does not render when nothing is being resized', () => {
    const { container } = render(<ResizeGuides />, {
      initialState: {
        ui: {
          resizeGuidesVisible: false
        }
      }
    })

    expect(container.firstChild).toBeNull()
  })

  it('renders while segment is resizing', () => {
    const { asFragment } = render(<ResizeGuides />, {
      initialState
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders only min guide', () => {
    (getSegmentVariantInfo as Mock).mockImplementationOnce(() => ({
      minWidth: { metric: 3 }
    }))

    const { container } = render(<ResizeGuides />, {
      initialState
    })
    expect(container.querySelector('.resize-guide-min')).toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-min-before')
    ).toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-min-after')
    ).toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-max')
    ).not.toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-max-before')
    ).not.toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-max-after')
    ).not.toBeInTheDocument()
  })

  it('renders only max guide', () => {
    (getSegmentVariantInfo as Mock).mockImplementationOnce(() => ({
      maxWidth: { metric: 4 }
    }))

    const { container } = render(<ResizeGuides />, {
      initialState
    })
    expect(
      container.querySelector('.resize-guide-min')
    ).not.toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-min-before')
    ).not.toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-min-after')
    ).not.toBeInTheDocument()
    expect(container.querySelector('.resize-guide-max')).toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-max-before')
    ).toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-max-after')
    ).toBeInTheDocument()
  })

  it('renders max and min guides', () => {
    (getSegmentVariantInfo as Mock).mockImplementationOnce(() => ({
      minWidth: { metric: 3 },
      maxWidth: { metric: 4 }
    }))

    const { container } = render(<ResizeGuides />, {
      initialState
    })
    expect(container.querySelector('.resize-guide-min')).toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-min-before')
    ).toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-min-after')
    ).toBeInTheDocument()
    expect(container.querySelector('.resize-guide-max')).toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-max-before')
    ).toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-max-after')
    ).toBeInTheDocument()
  })

  it('renders max guide when remaining width is large', () => {
    (getSegmentVariantInfo as Mock).mockImplementationOnce(() => ({
      maxWidth: { metric: 4 }
    }))

    const initialState = {
      ui: {
        resizeGuidesVisible: true,
        activeSegment: 0
      },
      street: {
        segments: [{ width: 1 }],
        // `remainingWidth` should be larger than `maxWidth`
        remainingWidth: 12,
        units: 0
      }
    }

    const { container } = render(<ResizeGuides />, {
      initialState
    })

    // But width should be based on `maxWidth`, not `remainingWidth`
    const width = 4 * TILE_SIZE
    expect(
      container.querySelector<HTMLElement>('.resize-guide-max')?.style.width
    ).toEqual(`${width}px`)

    // Also test that child elements are rendered
    expect(
      container.querySelector('.resize-guide-max-before')
    ).toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-max-after')
    ).toBeInTheDocument()
  })

  it('renders max guide when remaining width is small', () => {
    (getSegmentVariantInfo as Mock).mockImplementationOnce(() => ({
      maxWidth: { metric: 4 }
    }))

    // `remainingWidth` should be smaller than `maxWidth`
    // `segment` is given a `width` property so that calculations can be performed
    const remainingWidth = 1
    const segmentWidth = 1
    const initialState = {
      ui: {
        resizeGuidesVisible: true,
        activeSegment: 0
      },
      street: {
        segments: [{ width: segmentWidth }],
        remainingWidth,
        units: 0
      }
    }

    const { container } = render(<ResizeGuides />, {
      initialState
    })

    // Width should be based on `remainingWidth` + `segmentWidth`, not `maxWidth`
    const width = (remainingWidth + segmentWidth) * TILE_SIZE
    expect(
      container.querySelector<HTMLElement>('.resize-guide-max')?.style.width
    ).toEqual(`${width}px`)
  })

  it('renders max guide with only remaining width', () => {
    const remainingWidth = 6
    const segmentWidth = 1
    const initialState = {
      ui: {
        resizeGuidesVisible: true,
        activeSegment: 0
      },
      street: {
        segments: [{ width: segmentWidth }],
        remainingWidth,
        units: 0
      }
    }

    const { container } = render(<ResizeGuides />, {
      initialState
    })

    // Width should be based on `remainingWidth` + `segmentWidth`
    const width = (remainingWidth + segmentWidth) * TILE_SIZE
    expect(
      container.querySelector<HTMLElement>('.resize-guide-max')?.style.width
    ).toEqual(`${width}px`)
  })
})
