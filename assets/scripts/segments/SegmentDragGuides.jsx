import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { TILE_SIZE } from './constants'
import { getSegmentVariantInfo } from '../segments/info'
import { getSegmentEl } from '../segments/view'
import { MIN_SEGMENT_WIDTH } from '../segments/resizing'

export class SegmentDragGuides extends React.Component {
  static propTypes = {
    activeSegment: PropTypes.number,
    segment: PropTypes.object,
    remainingWidth: PropTypes.number
  }

  constructor (props) {
    super(props)

    this.state = {
      show: false
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (this.state.show !== nextState.show)
  }

  componentDidMount () {
    // Listen for events to show/hide
    window.addEventListener('stmx:show_segment_guides', this.showGuides)
    window.addEventListener('stmx:hide_segment_guides', this.hideGuides)
  }

  componentWillUnmount () {
    // Clean up when unmounted
    window.removeEventListener('stmx:show_segment_guides', this.showGuides)
    window.removeEventListener('stmx:hide_segment_guides', this.hideGuides)
  }

  showGuides = (event) => {
    this.setState({
      show: true
    })
  }

  hideGuides = (event) => {
    this.setState({
      show: false
    })
  }

  getStyle = (width) => {
    const pixelWidth = width * TILE_SIZE

    return {
      width: `${pixelWidth}px`,
      marginLeft: (-pixelWidth / 2) + 'px'
    }
  }

  render () {
    if (!this.state.show || !this.props.segment) return null

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
    activeSegment: (typeof state.ui.activeSegment === 'number') ? state.ui.activeSegment : null,
    segment: state.street.segments[state.ui.activeSegment] || null,
    remainingWidth: state.street.remainingWidth
  }
}

export default connect(mapStateToProps)(SegmentDragGuides)
