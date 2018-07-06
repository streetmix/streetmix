import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

export class SegmentDragHandles extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    position: PropTypes.number,
    activeSegment: PropTypes.number,
    infoBubbleHovered: PropTypes.bool,
    descriptionVisible: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.leftDragHandle = React.createRef()
    this.rightDragHandle = React.createRef()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (Number.isInteger(this.props.activeSegment) && Number.isInteger(prevProps.activeSegment)) {
      this.leftDragHandle.current.classList.add('drag-handle-show-immediate')
      this.rightDragHandle.current.classList.add('drag-handle-show-immediate')
      window.setTimeout(() => {
        // Check if ref still exists in case it is cleaned up by React
        if (this.leftDragHandle.current) {
          this.leftDragHandle.current.classList.remove('drag-handle-show-immediate')
        }
        if (this.rightDragHandle.current) {
          this.rightDragHandle.current.classList.remove('drag-handle-show-immediate')
        }
      }, 0)
    }
  }

  render () {
    // TODO: also hide drag handles immediately when drag motion starts.
    const display = (this.props.infoBubbleHovered || this.props.descriptionVisible)
      ? 'none' : null

    // To prevent drag handles from overlapping each other when the segment widths are very small,
    // we calculate an X-position adjustment when the value of `width` is less than 60px.
    // The X position adjustment follows the linear equation y = 0.5x - 35 (where `x` is `width`).
    // For example:
    //    width = 36 ==> adjustX = -11px
    //    width = 12 ==> adjustX = -29px
    const adjustX = (this.props.width < 60)
      ? `${(0.5 * this.props.width) - 35}px` : null

    let leftClassNames = 'drag-handle drag-handle-left'
    let rightClassNames = 'drag-handle drag-handle-right'
    if (this.props.activeSegment === this.props.position) {
      leftClassNames += ' drag-handle-show'
      rightClassNames += ' drag-handle-show'
    }

    return (
      <React.Fragment>
        <span className={leftClassNames} style={{ display, left: adjustX }} ref={this.leftDragHandle}>‹</span>
        <span className={rightClassNames} style={{ display, right: adjustX }} ref={this.rightDragHandle}>›</span>
      </React.Fragment>
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

export default connect(mapStateToProps)(SegmentDragHandles)
