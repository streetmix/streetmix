import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { TILE_SIZE } from './constants'
import { getSegmentVariantInfo } from '../segments/info'
import { MIN_SEGMENT_WIDTH } from '../segments/resizing'

export class SegmentDragGuides extends React.Component {
  static propTypes = {
    activeSegment: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    segments: PropTypes.array,
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
    if (!this.state.show || typeof this.props.activeSegment !== 'number') return null

    const segment = this.props.segments[this.props.activeSegment]
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

    return (
      <React.Fragment>
        {minGuide}
        {maxGuide}
      </React.Fragment>
    )
  }
}

function mapStateToProps (state) {
  return {
    activeSegment: state.ui.activeSegment,
    segments: state.street.segments,
    remainingWidth: state.street.remainingWidth
  }
}

export default connect(mapStateToProps)(SegmentDragGuides)
