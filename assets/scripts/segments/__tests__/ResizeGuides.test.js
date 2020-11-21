/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import ResizeGuides from '../ResizeGuides'
import { TILE_SIZE } from '../constants'
import { getSegmentVariantInfo } from '../info'

jest.mock('../view', () => ({
  // Function returns a mock element with properties we need to read
  getSegmentEl: () => ({
    offsetLeft: 50,
    offsetWidth: 50
  })
}))

jest.mock('../info', () => ({
  // Function returns mock segment variant info of nothing
  // Specific tests can use `mockImplementation` to make it return other info
  getSegmentVariantInfo: jest.fn(() => ({}))
}))

const initialState = {
  ui: {
    resizeGuidesVisible: true,
    activeSegment: 0
  },
  street: {
    segments: [{}],
    remainingWidth: 0
  }
}

describe('ResizeGuides', () => {
  it('does not render when nothing is being resized', () => {
    const { container } = renderWithReduxAndIntl(<ResizeGuides />, {
      initialState: {
        ui: {
          resizeGuidesVisible: false
        }
      }
    })

    expect(container.firstChild).toBeNull()
  })

  it('renders while segment is resizing', () => {
    const { asFragment } = renderWithReduxAndIntl(<ResizeGuides />, {
      initialState
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders only min guide', () => {
    getSegmentVariantInfo.mockImplementationOnce(() => ({
      minWidth: 10
    }))

    const { container } = renderWithReduxAndIntl(<ResizeGuides />, {
      initialState
    })
    expect(container.querySelector('.resize-guide-min')).toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-min-before')
    ).toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-min-after')
    ).toBeInTheDocument()
    expect(container.querySelector('.resize-guide-max')).not.toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-max-before')
    ).not.toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-max-after')
    ).not.toBeInTheDocument()
  })

  it('renders only max guide', () => {
    getSegmentVariantInfo.mockImplementationOnce(() => ({
      maxWidth: 12
    }))

    const { container } = renderWithReduxAndIntl(<ResizeGuides />, {
      initialState
    })
    expect(container.querySelector('.resize-guide-min')).not.toBeInTheDocument()
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
    getSegmentVariantInfo.mockImplementationOnce(() => ({
      minWidth: 10,
      maxWidth: 12
    }))

    const { container } = renderWithReduxAndIntl(<ResizeGuides />, {
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
    const maxWidth = 20
    getSegmentVariantInfo.mockImplementationOnce(() => ({ maxWidth }))

    const initialState = {
      ui: {
        resizeGuidesVisible: true,
        activeSegment: 0
      },
      street: {
        segments: [{}],
        // `remainingWidth` should be larger than `maxWidth`
        remainingWidth: 30
      }
    }

    const { container } = renderWithReduxAndIntl(<ResizeGuides />, {
      initialState
    })

    // But width should be based on `maxWidth`, not `remainingWidth`
    const width = maxWidth * TILE_SIZE
    expect(container.querySelector('.resize-guide-max').style.width).toEqual(
      `${width}px`
    )

    // Also test that child elements are rendered
    expect(
      container.querySelector('.resize-guide-max-before')
    ).toBeInTheDocument()
    expect(
      container.querySelector('.resize-guide-max-after')
    ).toBeInTheDocument()
  })

  it('renders max guide when remaining width is small', () => {
    const maxWidth = 20
    getSegmentVariantInfo.mockImplementationOnce(() => ({ maxWidth }))

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
        remainingWidth: remainingWidth
      }
    }

    const { container } = renderWithReduxAndIntl(<ResizeGuides />, {
      initialState
    })

    // Width should be based on `remainingWidth` + `segmentWidth`, not `maxWidth`
    const width = (remainingWidth + segmentWidth) * TILE_SIZE
    expect(container.querySelector('.resize-guide-max').style.width).toEqual(
      `${width}px`
    )
  })

  it('renders max guide with only remaining width', () => {
    const remainingWidth = 19
    const segmentWidth = 1
    const initialState = {
      ui: {
        resizeGuidesVisible: true,
        activeSegment: 0
      },
      street: {
        segments: [{ width: segmentWidth }],
        remainingWidth: remainingWidth
      }
    }

    const { container } = renderWithReduxAndIntl(<ResizeGuides />, {
      initialState
    })

    // Width should be based on `remainingWidth` + `segmentWidth`
    const width = (remainingWidth + segmentWidth) * TILE_SIZE
    expect(container.querySelector('.resize-guide-max').style.width).toEqual(
      `${width}px`
    )
  })
})
