import React from 'react'
import PropTypes from 'prop-types'
import flow from 'lodash/flow'
import { connect } from 'react-redux'
import { DragSource } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { DragTypes } from './constants'
// import { handleSegmentResizeStart } from './drag_and_drop'

const dragSpec = {
  beginDrag (props, monitor, component) {
    console.log('hi drag start')
    return {
      position: props.position
    }
  }
}

function dragCollect (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}

export class SegmentDragHandles extends React.Component {
  static propTypes = {
    // Provided by parent
    width: PropTypes.number,
    position: PropTypes.number,

    // Provided by store
    activeSegment: PropTypes.number,
    infoBubbleHovered: PropTypes.bool,
    descriptionVisible: PropTypes.bool,

    // Provided by react-dnd DragSource and DropTarget
    connectDragSource: PropTypes.func,
    connectDragPreview: PropTypes.func
    // isDragging: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.leftDragHandle = React.createRef()
    this.rightDragHandle = React.createRef()
  }

  componentDidMount = () => {
    this.props.connectDragPreview(getEmptyImage(), { captureDraggingState: true })
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    /**
     * temporarily removed because refs are breaking connectDragSource
     */
    // if (Number.isInteger(this.props.activeSegment) && Number.isInteger(prevProps.activeSegment)) {
    //   this.leftDragHandle.current.classList.add('drag-handle-show-immediate')
    //   this.rightDragHandle.current.classList.add('drag-handle-show-immediate')
    //   window.setTimeout(() => {
    //     // Check if ref still exists in case it is cleaned up by React
    //     if (this.leftDragHandle.current) {
    //       this.leftDragHandle.current.classList.remove('drag-handle-show-immediate')
    //     }
    //     if (this.rightDragHandle.current) {
    //       this.rightDragHandle.current.classList.remove('drag-handle-show-immediate')
    //     }
    //   }, 0)
    // }
  }

  onMouseDown = (event) => {
    // handleSegmentResizeStart(event)
  }

  renderLeftDragHandle = (classNames, display, adjust) => {
    return this.props.connectDragSource(
      <span className={classNames} style={{ display, left: adjust }} onMouseDown={this.onMouseDown}>‹</span>
    )
  }

  renderRightDragHandle = (classNames, display, adjust) => {
    return this.props.connectDragSource(
      <span className={classNames} style={{ display, right: adjust }} onMouseDown={this.onMouseDown}>›</span>
    )
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
        {this.renderLeftDragHandle(leftClassNames, display, adjustX)}
        {this.renderRightDragHandle(rightClassNames, display, adjustX)}
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

export default flow(
  DragSource(DragTypes.SEGMENT_DRAG_HANDLE, dragSpec, dragCollect),
  connect(mapStateToProps)
)(SegmentDragHandles)
