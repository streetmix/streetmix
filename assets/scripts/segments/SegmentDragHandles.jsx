import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

export class SegmentDragHandles extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    infoBubbleHovered: PropTypes.bool,
    descriptionVisible: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.dragHandleLeft = React.createRef()
    this.dragHandleRight = React.createRef()
  }

  componentDidMount () {
    // TODO: do not store a reference to the element directly on the DOM.
    this.dragHandleLeft.current.segmentEl = this.dragHandleLeft.current.parentNode
    this.dragHandleRight.current.segmentEl = this.dragHandleLeft.current.parentNode
  }

  render () {
    const display = (this.props.infoBubbleHovered || this.props.descriptionVisible)
      ? 'none' : 'block'

    // To prevent drag handles from overlapping each other when the segment widths are very small,
    // we calculate an X-position adjustment when the value of `width` is less than 60px.
    // The X position adjustment follows the linear equation y = 0.5x - 35 (where `x` is `width`).
    // For example, (`width = 36`, `adjustX = -11px`), (`width = 12`, `adjustX = -29px`).
    const adjustX = (this.props.width < 60)
      ? `${(0.5 * this.props.width) - 35}px` : null

    return (
      <React.Fragment>
        <span className="drag-handle left" style={{ display, left: adjustX }} ref={this.dragHandleLeft}>‹</span>
        <span className="drag-handle right" style={{ display, right: adjustX }} ref={this.dragHandleRight}>›</span>
      </React.Fragment>
    )
  }
}

function mapStateToProps (state) {
  return {
    infoBubbleHovered: state.infoBubble.mouseInside,
    descriptionVisible: state.infoBubble.descriptionVisible
  }
}

export default connect(mapStateToProps)(SegmentDragHandles)
