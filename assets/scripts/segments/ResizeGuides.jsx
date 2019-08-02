import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { TILE_SIZE, MIN_SEGMENT_WIDTH } from './constants'
import { getSegmentVariantInfo } from './info'
import { getSegmentEl } from './view'
import './ResizeGuides.scss'

export class ResizeGuides extends React.Component {
  static propTypes = {
    isVisible: PropTypes.bool,
    activeSegment: PropTypes.number,
    segment: PropTypes.object,
    remainingWidth: PropTypes.number
  }

  static defaultProps = {
    isVisible: false
  }

  /**
   * Only updates on a change in value of the `isVisible` prop (which
   * shows/hides the guides), to prevent continuous re-renders during a
   * resize drag input. Its appearance should remain the same throughout the
   * entire drag action.
   *
   * The `segment` and `remainingWidth` props may change during the resizing,
   * so we can't rely on PureComponent.
   */
  shouldComponentUpdate = (nextProps) => {
    return (this.props.isVisible !== nextProps.isVisible)
  }

  getStyle (width) {
    const pixelWidth = width * TILE_SIZE

    return {
      width: `${pixelWidth}px`,
      marginLeft: (-pixelWidth / 2) + 'px'
    }
  }

  renderMinGuides = (width) => {
    return (
      <div className="resize-guide resize-guide-min" style={this.getStyle(width)}>
        <div className="resize-guide-min-before">
          « <FormattedMessage id="segments.resize.min" defaultMessage="Min" />
        </div>
        <div className="resize-guide-min-after">
          <FormattedMessage id="segments.resize.min" defaultMessage="Min" /> »
        </div>
      </div>
    )
  }

  renderMaxGuides = (width) => {
    return (
      <div className="resize-guide resize-guide-max" style={this.getStyle(width)}>
        <div className="resize-guide-max-before">
          <FormattedMessage id="segments.resize.max" defaultMessage="Max" /> »
        </div>
        <div className="resize-guide-max-after">
          « <FormattedMessage id="segments.resize.max" defaultMessage="Max" />
        </div>
      </div>
    )
  }

  render () {
    if (!this.props.isVisible || !this.props.segment) return null

    const segment = this.props.segment
    const variantInfo = getSegmentVariantInfo(segment.type, segment.variantString)
    let minGuide, maxGuide

    // Render minimum-width guides if minimum widths are recommended by the
    // segment variant
    if (variantInfo.minWidth) {
      minGuide = this.renderMinGuides(variantInfo.minWidth)
    }

    // Maximum-width guides are displayed based on recommended maximum widths
    // of the segment variant, if provided, but this is also limited by the
    // remaining space of the street. If no maximum-width recommendations
    // are provided, the maximum width would be any remaining width of the street.
    const remainingWidth = this.props.remainingWidth + segment.width
    const shouldUseRemainingWidth = remainingWidth &&
      (((!variantInfo.minWidth) && (remainingWidth >= MIN_SEGMENT_WIDTH)) || (remainingWidth >= variantInfo.minWidth)) &&
      ((!variantInfo.maxWidth) || (remainingWidth <= variantInfo.maxWidth))

    if (shouldUseRemainingWidth) {
      maxGuide = this.renderMaxGuides(remainingWidth)
    } else if (variantInfo.maxWidth) {
      maxGuide = this.renderMaxGuides(variantInfo.maxWidth)
    }

    // Calculate the centerline of the segment (its left offset plus half its width)
    // Adjusting the centerline by 1px to the left seems to "look" better
    const el = getSegmentEl(this.props.activeSegment)
    const centerline = el.offsetLeft + (el.cssTransformLeft || 0) + (el.offsetWidth / 2) - 1

    return (
      <div className="resize-guides" style={{ left: centerline }}>
        {minGuide}
        {maxGuide}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    isVisible: state.ui.resizeGuidesVisible,
    activeSegment: (typeof state.ui.activeSegment === 'number') ? state.ui.activeSegment : null,
    segment: state.street.segments[state.ui.activeSegment] || null,
    remainingWidth: state.street.remainingWidth
  }
}

export default connect(mapStateToProps)(ResizeGuides)
