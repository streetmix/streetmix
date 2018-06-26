import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { TILE_SIZE } from './constants'
import { getSegmentVariantInfo } from '../segments/info'
import { MIN_SEGMENT_WIDTH } from '../segments/resizing'

export class SegmentDragGuides extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    variantString: PropTypes.string.isRequired,
    width: PropTypes.number,
    dataNo: PropTypes.number,
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
    window.addEventListener('stmx:show_segment_guides', (e) => {
      if (e.detail.dataNo === this.props.dataNo) {
        this.setState({
          show: true
        })
      }
    })
    window.addEventListener('stmx:hide_segment_guides', (e) => {
      if (e.detail.dataNo === this.props.dataNo) {
        this.setState({
          show: false
        })
      }
    })
  }

  render () {
    if (!this.state.show) return null

    const variantInfo = getSegmentVariantInfo(this.props.type, this.props.variantString)
    let minGuide, maxGuide

    if (variantInfo.minWidth) {
      const width = variantInfo.minWidth * TILE_SIZE
      const style = {
        width: `${width}px`,
        marginLeft: (-width / 2) + 'px'
      }

      minGuide = <div className="guide min" style={style} />
    }

    const remainingWidth = this.props.remainingWidth + this.props.width

    if (remainingWidth &&
      (((!variantInfo.minWidth) && (remainingWidth >= MIN_SEGMENT_WIDTH)) || (remainingWidth >= variantInfo.minWidth)) &&
      ((!variantInfo.maxWidth) || (remainingWidth <= variantInfo.maxWidth))) {
      const width = remainingWidth * TILE_SIZE
      const style = {
        width: `${width}px`,
        marginLeft: (-width / 2) + 'px'
      }

      maxGuide = <div className="guide max" style={style} />
    } else if (variantInfo.maxWidth) {
      const width = variantInfo.maxWidth * TILE_SIZE
      const style = {
        width: `${width}px`,
        marginLeft: (-width / 2) + 'px'
      }

      maxGuide = <div className="guide max" style={style} />
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
    remainingWidth: state.street.remainingWidth
  }
}

export default connect(mapStateToProps)(SegmentDragGuides)
