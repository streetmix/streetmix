import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { TILE_SIZE } from './constants'
import { getSegmentVariantInfo } from '../segments/info'
import { getSegmentEl } from '../segments/view'
import { MIN_SEGMENT_WIDTH } from '../segments/resizing'

export class ResizeGuides extends React.Component {
  static propTypes = {
    isResizing: PropTypes.bool,
    activeSegment: PropTypes.number,
    segment: PropTypes.object,
    remainingWidth: PropTypes.number
  }

  static defaultProps = {
    isResizing: false
  }

  /**
   * Only updates on a change in value of the `isResizing` prop (which
   * shows/hides the guides), to prevent continuous re-renders during a
   * resize drag input. Its appearance should remain the same throughout the
   * entire drag action.
   *
   * The `segment` and `remainingWidth` props may change during the resizing,
   * so we can't rely on PureComponent.
   */
  shouldComponentUpdate = (nextProps) => {
    return (this.props.isResizing !== nextProps.isResizing)
  }

  getStyle (width) {
    const pixelWidth = width * TILE_SIZE

    return {
      width: `${pixelWidth}px`,
      marginLeft: (-pixelWidth / 2) + 'px'
    }
  }

  render () {
    if (!this.props.isResizing || !this.props.segment) return null

    const segment = this.props.segment
    const variantInfo = getSegmentVariantInfo(segment.type, segment.variantString)
    let minGuide, maxGuide

    if (variantInfo.minWidth) {
      minGuide = (
        <div className="segment-guide segment-guide-min" style={this.getStyle(variantInfo.minWidth)}>
          <div className="segment-guide-min-before">« <FormattedMessage id="segment.resize.min" defaultMessage="Min" /></div>
          <div className="segment-guide-min-after"><FormattedMessage id="segment.resize.min" defaultMessage="Min" /> »</div>
        </div>
      )
    }

    const remainingWidth = this.props.remainingWidth + segment.width

    if (remainingWidth &&
      (((!variantInfo.minWidth) && (remainingWidth >= MIN_SEGMENT_WIDTH)) || (remainingWidth >= variantInfo.minWidth)) &&
      ((!variantInfo.maxWidth) || (remainingWidth <= variantInfo.maxWidth))) {
      maxGuide = (
        <div className="segment-guide segment-guide-max" style={this.getStyle(remainingWidth)}>
          <div className="segment-guide-max-before"><FormattedMessage id="segment.resize.max" defaultMessage="Max" /> »</div>
          <div className="segment-guide-max-after">« <FormattedMessage id="segment.resize.max" defaultMessage="Max" /></div>
        </div>
      )
    } else if (variantInfo.maxWidth) {
      maxGuide = (
        <div className="segment-guide segment-guide-max" style={this.getStyle(variantInfo.maxWidth)}>
          <div className="segment-guide-max-before"><FormattedMessage id="segment.resize.max" defaultMessage="Max" /> »</div>
          <div className="segment-guide-max-after">« <FormattedMessage id="segment.resize.max" defaultMessage="Max" /></div>
        </div>
      )
    }

    // Calculate the centerline of the segment (its left offset plus half its width)
    // Adjusting the centerline by 1px to the left seems to "look" better
    const el = getSegmentEl(this.props.activeSegment)
    const centerline = el.offsetLeft + (el.cssTransformLeft || 0) + (el.offsetWidth / 2) - 1

    return (
      <div className="segment-guides" style={{ left: centerline }}>
        {minGuide}
        {maxGuide}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    isResizing: state.ui.resizeDragState,
    activeSegment: (typeof state.ui.activeSegment === 'number') ? state.ui.activeSegment : null,
    segment: state.street.segments[state.ui.activeSegment] || null,
    remainingWidth: state.street.remainingWidth
  }
}

export default connect(mapStateToProps)(ResizeGuides)
