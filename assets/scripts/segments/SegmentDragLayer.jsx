import React from 'react'
import PropTypes from 'prop-types'
import { DragLayer } from 'react-dnd'
import SegmentCanvas from './SegmentCanvas'

const DRAG_OFFSET_Y_PALETTE = -340 - 150
const MAX_DRAG_DEGREE = 20

class SegmentDragLayer extends React.Component {
  static propTypes = {
    isDragging: PropTypes.bool.isRequired,
    currentOffset: PropTypes.object,
    item: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      deltaX: 0,
      mouseX: (props.currentOffset && props.currentOffset.x),
      draggedItem: (props.item && props.item.dataNo)
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.currentOffset && nextProps.currentOffset.x !== prevState.mouseX) {
      const { x } = nextProps.currentOffset

      return {
        mouseX: x,
        deltaX: (prevState.mouseX && prevState.dataNo === nextProps.dataNo) ? (x - prevState.mouseX) : 0,
        draggedItem: (nextProps.item && nextProps.item.dataNo)
      }
    }

    return null
  }

  getSegmentStyle = () => {
    const { currentOffset, item } = this.props

    if (!currentOffset) {
      return {
        display: 'none'
      }
    }

    let { x, y } = currentOffset
    if (item.forPalette) {
      x -= item.width / 3
      y += DRAG_OFFSET_Y_PALETTE
    }

    let deg = this.state.deltaX
    if (deg > MAX_DRAG_DEGREE) {
      deg = MAX_DRAG_DEGREE
    } else if (deg < -MAX_DRAG_DEGREE) {
      deg = -MAX_DRAG_DEGREE
    }

    const transform = `translate(${x}px, ${y}px) rotateZ(${deg}deg)`
    return {
      transform: transform,
      WebkitTransform: transform
    }
  }

  render () {
    const { isDragging, item } = this.props

    if (!isDragging) return null

    return (
      <div className="segment-drag-layer">
        <div className="floating segment" style={this.getSegmentStyle()}>
          <SegmentCanvas {...item} forPalette={false} />
        </div>
      </div>
    )
  }
}

function collect (monitor) {
  return {
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
  }
}

export default DragLayer(collect)(SegmentDragLayer)
