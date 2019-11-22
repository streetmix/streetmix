import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { TILE_SIZE, MIN_SEGMENT_WIDTH } from './constants'
import { getSegmentVariantInfo } from './info'
import { getSegmentEl } from './view'
import './ResizeGuides.scss'

ResizeGuides.propTypes = {
  isVisible: PropTypes.bool,
  activeSegment: PropTypes.number,
  segment: PropTypes.object,
  remainingWidth: PropTypes.number
}

function ResizeGuides ({
  isVisible = false,
  activeSegment,
  segment,
  remainingWidth
}) {
  if (!isVisible || !segment) return null

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
  // Adjusting the centerline by 1px to the left seems to "look" better
  const el = getSegmentEl(activeSegment)
  const centerline =
    el.offsetLeft + (el.cssTransformLeft || 0) + el.offsetWidth / 2 - 1

  return (
    <div className="resize-guides" style={{ left: centerline }}>
      {shouldRenderMinGuide && (
        <div
          className="resize-guide resize-guide-min"
          style={getStyle(variantInfo.minWidth)}
        >
          <div className="resize-guide-min-before">
            « <FormattedMessage id="segments.resize.min" defaultMessage="Min" />
          </div>
          <div className="resize-guide-min-after">
            <FormattedMessage id="segments.resize.min" defaultMessage="Min" /> »
          </div>
        </div>
      )}
      {shouldRenderMaxGuide && (
        <div
          className="resize-guide resize-guide-max"
          style={getStyle(
            shouldUseRemainingWidth
              ? actualRemainingWidth
              : variantInfo.maxWidth
          )}
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

function getStyle (width) {
  const pixelWidth = width * TILE_SIZE

  return {
    width: `${pixelWidth}px`,
    marginLeft: -pixelWidth / 2 + 'px'
  }
}

function mapStateToProps (state) {
  return {
    isVisible: state.ui.resizeGuidesVisible,
    activeSegment:
      typeof state.ui.activeSegment === 'number'
        ? state.ui.activeSegment
        : null,
    segment: state.street.segments[state.ui.activeSegment] || null,
    remainingWidth: state.street.remainingWidth
  }
}

export default connect(mapStateToProps)(
  React.memo(
    ResizeGuides,
    /**
     * Only updates on a change in value of the `isVisible` prop (which
     * shows/hides the guides), to prevent continuous re-renders during a
     * resize drag input. Its appearance should remain the same throughout the
     * entire drag action.
     *
     * The `segment` and `remainingWidth` props may change during the resizing,
     * so we can't rely on normal memoization of all props.
     *
     * Note that we cannot use the useSelector hook because that doesn't give
     * us a way to do this comparison of just the one value.
     */
    (prevProps, nextProps) => prevProps.isVisible === nextProps.isVisible
  )
)
