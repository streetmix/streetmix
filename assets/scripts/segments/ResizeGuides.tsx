import React, { useMemo } from 'react'
import { FormattedMessage } from 'react-intl'
import { useSelector } from '../store/hooks'
import { getElRelativePos } from '../util/helpers'
import type { Segment } from '../types'
import { TILE_SIZE, MIN_SEGMENT_WIDTH } from './constants'
import { getSegmentVariantInfo } from './info'
import { getSegmentEl } from './view'
import './ResizeGuides.scss'

function ResizeGuides (): React.ReactElement | null {
  const isVisible = useSelector(({ ui }) => ui.resizeGuidesVisible)
  const segmentId = useSelector(({ ui }) =>
    typeof ui.activeSegment === 'number' ? ui.activeSegment : null
  )
  const segment = useSelector(({ street }) =>
    typeof segmentId === 'number' ? street.segments[segmentId] : null
  )
  const remainingWidth = useSelector(({ street }) => street.remainingWidth)

  // Calculate render position when the resize guides become visible.
  // The position is memoized to prevent unnecessary re-renders during a
  // resize drag action. Its appearance should remain the same throughout the
  // entire drag action.
  const display = useMemo(
    () => calculate(isVisible, segment, segmentId, remainingWidth),
    // The `segment` and `remainingWidth` values may change during the resizing,
    // but they should NOT update this calculation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isVisible, segmentId]
  )

  if (isVisible === null || segment === null) return null

  return (
    <div className="resize-guides" style={display.style}>
      {display.minGuideStyle && (
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
      {display.maxGuideStyle && (
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

function calculate (
  isVisible: boolean,
  segment: Segment | null,
  segmentId: number | null,
  remainingWidth: number
): {
    style?: React.CSSProperties
    minGuideStyle?: React.CSSProperties
    maxGuideStyle?: React.CSSProperties
  } {
  if (!isVisible || segment === null || segmentId === null) return {}

  // TODO: fix type of variantInfo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variantInfo: any = getSegmentVariantInfo(
    segment.type,
    segment.variantString
  )

  // Maximum-width guides are displayed based on recommended maximum widths
  // of the segment variant, if provided, but this is also limited by the
  // remaining space of the street. If no maximum-width recommendations
  // are provided, the maximum width would be any remaining width of the street.
  const actualRemainingWidth = remainingWidth + segment.width
  const shouldUseRemainingWidth =
    actualRemainingWidth > 0 &&
    ((typeof variantInfo.minWidth === 'undefined' &&
      actualRemainingWidth >= MIN_SEGMENT_WIDTH) ||
      actualRemainingWidth >= variantInfo.minWidth) &&
    (typeof variantInfo.maxWidth === 'undefined' ||
      actualRemainingWidth <= variantInfo.maxWidth)

  // Render minimum-width guides if minimum widths are recommended by the
  // segment variant
  const shouldRenderMinGuide = Number.isFinite(variantInfo.minWidth)
  const shouldRenderMaxGuide =
    shouldUseRemainingWidth || Number.isFinite(variantInfo.maxWidth)

  // Calculate the centerline of the segment (its left offset plus half its width)
  const el = getSegmentEl(segmentId)
  const [posX] = getElRelativePos(el)
  const centerline = posX + el.offsetWidth / 2

  return {
    style: { left: centerline },
    minGuideStyle: shouldRenderMinGuide
      ? getStyle(variantInfo.minWidth)
      : undefined,
    maxGuideStyle: shouldRenderMaxGuide
      ? getStyle(
        shouldUseRemainingWidth ? actualRemainingWidth : variantInfo.maxWidth
      )
      : undefined
  }
}

function getStyle (width: number): React.CSSProperties {
  const pixelWidth = width * TILE_SIZE

  return {
    width: `${pixelWidth}px`,
    marginLeft: -pixelWidth / 2 + 'px'
  }
}

export default ResizeGuides
