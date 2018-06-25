import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

export class SegmentDragHandles extends React.Component {
  static propTypes = {
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
    const style = {
      display: 'block'
    }

    if (this.props.infoBubbleHovered || this.props.descriptionVisible) {
      style.display = 'none'
    }

    return (
      <React.Fragment>
        <span className="drag-handle left" style={style} ref={this.dragHandleLeft}>‹</span>
        <span className="drag-handle right" style={style} ref={this.dragHandleRight}>›</span>
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
