import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ResizeHandle from './ResizeHandle'
import { getSegmentEl } from './view'

export class ResizeHandles extends React.Component {
  static propTypes = {
    activeSegment: PropTypes.number,
    infoBubbleHovered: PropTypes.bool,
    descriptionVisible: PropTypes.bool
  }

  static defaultProps = {
    infoBubbleHovered: false,
    descriptionVisible: false
  }

  constructor (props) {
    super(props)

    this.state = {
      isHidden: false
    }
  }

  static getDerivedStateFromProps (props, state) {
    return {
      isHidden: (props.infoBubbleHovered || props.descriptionVisible)
    }
  }

  // Based on placement of active segment element, determine values to position the
  // handle elements. The values are absolute positioning numbers from left side of the street
  // NOTE: when dragging, position will be overridden by mouse position. Only use these
  // values when NOT dragging.
  /**
   * @param {Number} - activeSegment
   */
  getInitialPosition = (activeSegment) => {
    const el = getSegmentEl(activeSegment)
    if (!el) return null

    const elLeft = el.offsetLeft + (el.cssTransformLeft || 0)
    const elRight = elLeft + el.offsetWidth

    const HANDLE_OFFSET = 5 // in pixels
    const HANDLE_WIDTH = 30 // in pixels (hardcoded)

    // To prevent drag handles from overlapping each other when the segment
    // element is very narrow, we calculate an X-position adjustment when the
    // segment element width is less than 2 * the handle width (so, 60px).
    // The X position adjustment follows the linear equation y = 0.5x - z,
    // where `x` is the segment element width, and `z` is the handle element
    // width.
    // For example:
    //    width = 36 ==> adjustX = -12
    //    width = 12 ==> adjustX = -24
    const adjustX = (el.offsetWidth < (2 * HANDLE_WIDTH))
      ? (0.5 * el.offsetWidth) - HANDLE_WIDTH : 0

    const leftHandlePos = elLeft - HANDLE_OFFSET + adjustX
    const rightHandlePos = elRight - HANDLE_WIDTH + HANDLE_OFFSET - adjustX

    return {
      left: `${leftHandlePos}px`,
      right: `${rightHandlePos}px`
    }
  }

  render () {
    const pos = this.getInitialPosition(this.props.activeSegment)
    if (!pos) return null

    return (
      <>
        <ResizeHandle
          hide={this.state.isHidden}
          direction="left"
          offsetLeft={pos.left}
          activeSegment={this.props.activeSegment}
        />
        <ResizeHandle
          hide={this.state.isHidden}
          direction="right"
          offsetLeft={pos.right}
          activeSegment={this.props.activeSegment}
        />
      </>
    )
  }
}

function mapStateToProps (state) {
  return {
    activeSegment: (typeof state.ui.activeSegment === 'number') ? state.ui.activeSegment : null,
    infoBubbleHovered: state.infoBubble.mouseInside,
    descriptionVisible: state.infoBubble.descriptionVisible
  }
}

export default connect(mapStateToProps)(ResizeHandles)
