import React, { useMemo } from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector } from '../store/hooks'
import { getElRelativePos } from '../util/helpers'
import { getWidthInMetric } from '../util/width_units'
import { TILE_SIZE, MIN_SEGMENT_WIDTH } from './constants'
import { getSegmentVariantInfo } from './info'
import { getSegmentEl } from './view'
import type { Segment, UnitsSetting } from '@streetmix/types'
import './ResizeGuides.css'

function ResizeGuides (): React.ReactElement | null {
  const isVisible = useSelector(({ ui }) => ui.resizeGuidesVisible)
  const segmentId = useSelector(({ ui }) => ui.activeSegment)
  const segment: Segment | null = useSelector(({ street }) =>
    segmentId !== null ? street.segments[segmentId] : null
  )
  const units: UnitsSetting = useSelector(({ street }) => street.units)
  const remainingWidth = useSelector(({ street }) => street.remainingWidth)

  // Calculate render position when the resize guides become visible.
  // The position is memoized to prevent unnecessary re-renders during a
  // resize drag action. Its appearance should remain the same throughout the
  // entire drag action.
  const display = useMemo(
    () => calculateStyles(isVisible, segmentId, segment, remainingWidth, units),
    // The `segment` and `remainingWidth` values may change during the resize
    // action, but they should NOT update this calculation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isVisible, segmentId]
  )

  if (!isVisible || segment === null) return null

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

function calculateStyles (
  isVisible: boolean,
  segmentId: number | null,
  segment: Segment | null,
  remainingWidth: number,
  units: UnitsSetting
): {
    style?: React.CSSProperties
    minGuideStyle?: React.CSSProperties
    maxGuideStyle?: React.CSSProperties
  } {
  if (!isVisible || segmentId === null || segment === null) return {}

  const variantInfo = getSegmentVariantInfo(segment.type, segment.variantString)

  // If the variant has a minimum width defined, we show minimum-width guides
  const minWidth = getWidthInMetric(variantInfo.minWidth, units)
  const maxWidth = getWidthInMetric(variantInfo.maxWidth, units)

  // Maximum-width guides are based on several factors:
  // - If the variant does not have a maximum width defined, then the segment's
  //   maximum width is the remaining width of the street, if any
  // - If the variant has a maximum width defined, then the segment is limited
  //   to that definition, or the remaining width of the street, whichever is
  //   is lower.
  // - Lastly, there is an edge case. If the segment has a _minimum_ width
  //   defined, but there isn't any remaining space after the segment has hit
  //   the minimum width, then we don't show the maximum guide at all.
  const actualRemainingWidth = remainingWidth + segment.width
  const shouldUseRemainingWidth =
    actualRemainingWidth > 0 &&
    ((minWidth === undefined && actualRemainingWidth >= MIN_SEGMENT_WIDTH) ||
      (minWidth !== undefined && actualRemainingWidth >= minWidth)) &&
    (maxWidth === undefined || actualRemainingWidth <= maxWidth)

  // Calculate the centerline of the segment (its left offset plus half its width)
  const el = getSegmentEl(segmentId)
  const [posX] = getElRelativePos(el)
  const centerline = posX + el.offsetWidth / 2

  // Returns styles used to position the guides
  return {
    style: { left: centerline },
    minGuideStyle: getStyle(minWidth),
    maxGuideStyle: shouldUseRemainingWidth
      ? getStyle(actualRemainingWidth)
      : getStyle(maxWidth)
  }
}

function getStyle (width: number | undefined): React.CSSProperties | undefined {
  if (typeof width !== 'number') return undefined

  const pixelWidth = width * TILE_SIZE

  return {
    width: `${pixelWidth}px`,
    marginLeft: -pixelWidth / 2 + 'px'
  }
}

export default ResizeGuides
