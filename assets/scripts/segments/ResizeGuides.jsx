import React from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { getElRelativePos } from '../util/helpers'
import { TILE_SIZE, MIN_SEGMENT_WIDTH } from './constants'
import { getSegmentVariantInfo } from './info'
import { getSegmentEl } from './view'
import './ResizeGuides.scss'

function ResizeGuides (props) {
  const isVisible = useSelector((state) => state.ui.resizeGuidesVisible)
  const segmentId = useSelector((state) =>
    typeof state.ui.activeSegment === 'number' ? state.ui.activeSegment : null
  )
  const segment = useSelector(
    (state) => state.street.segments[segmentId] || null
  )
  const remainingWidth = useSelector((state) => state.street.remainingWidth)

  // Calculate render position when the resize guides become visible.
  // The position is memoized to prevent unnecessary re-renders during a
  // resize drag action. Its appearance should remain the same throughout the
  // entire drag action.
  //
  // The `segment` and `remainingWidth` values may change during the resizing,
  // but they should NOT update this calculation.
  const display = React.useMemo(
    () => calculate(isVisible, segment, segmentId, remainingWidth),
    [isVisible, segmentId]
  )

  if (!isVisible || !segment) return null

  return (
    <div className="resize-guides" style={display.style}>
      {display.minGuide && (
        <div
          className="resize-guide resize-guide-min"
          style={display.minGuideStyle}
        >
          <div className="resize-guide-min-before">
            « <FormattedMessage id="segments.resize.min" defaultMessage="Min" />
          </div>
          <div className="resize-guide-min-after">
            <FormattedMessage id="segments.resize.min" defaultMessage="Min" /> »
          </div>
        </div>
      )}
      {display.maxGuide && (
        <div
          className="resize-guide resize-guide-max"
          style={display.maxGuideStyle}
        >
          <div className="resize-guide-max-before">
            <FormattedMessage id="segments.resize.max" defaultMessage="Max" /> »
          </div>
          <div className="resize-guide-max-after">
            « <FormattedMessage id="segments.resize.max" defaultMessage="Max" />
          </div>
        </div>
      )}
    </div>
  )
}

function calculate (isVisible, segment, segmentId, remainingWidth) {
  if (!isVisible) return {}

  const variantInfo = getSegmentVariantInfo(segment.type, segment.variantString)

  // Maximum-width guides are displayed based on recommended maximum widths
  // of the segment variant, if provided, but this is also limited by the
  // remaining space of the street. If no maximum-width recommendations
  // are provided, the maximum width would be any remaining width of the street.
  const actualRemainingWidth = remainingWidth + segment.width
  const shouldUseRemainingWidth =
    actualRemainingWidth &&
    ((!variantInfo.minWidth && actualRemainingWidth >= MIN_SEGMENT_WIDTH) ||
      actualRemainingWidth >= variantInfo.minWidth) &&
    (!variantInfo.maxWidth || actualRemainingWidth <= variantInfo.maxWidth)

  // Render minimum-width guides if minimum widths are recommended by the
  // segment variant
  const shouldRenderMinGuide = Number.isFinite(variantInfo.minWidth)
  const shouldRenderMaxGuide =
    shouldUseRemainingWidth || Number.isFinite(variantInfo.maxWidth)

  // Calculate the centerline of the segment (its left offset plus half its width)
  const el = getSegmentEl(segmentId)
  // Get its X position and account for CSS transform position, if any
  const [posX] = getElRelativePos(el)

  const centerline = posX + el.offsetWidth / 2

  return {
    style: { left: centerline },
    minGuide: shouldRenderMinGuide,
    minGuideStyle: getStyle(variantInfo.minWidth),
    maxGuide: shouldRenderMaxGuide,
    maxGuideStyle: getStyle(
      shouldUseRemainingWidth ? actualRemainingWidth : variantInfo.maxWidth
    )
  }
}

function getStyle (width) {
  const pixelWidth = width * TILE_SIZE

  return {
    width: `${pixelWidth}px`,
    marginLeft: -pixelWidth / 2 + 'px'
  }
}

export default ResizeGuides
