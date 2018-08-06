import React from 'react'
import PropTypes from 'prop-types'
import { DragLayer } from 'react-dnd'
import { throttle } from 'lodash'
import SegmentCanvas from './SegmentCanvas'
import { DragTypes } from './constants'
import { duringSegmentResize } from './resize_drag'

const DRAG_OFFSET_Y_PALETTE = -340 - 150
const MAX_DRAG_DEGREE = 20
const SEGMENT_RESIZE_THROTTLE = 20 // in milliseconds

class SegmentDragLayer extends React.PureComponent {
  static propTypes = {
    item: PropTypes.object,
    type: PropTypes.string,
    initialOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }),
    currentOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }),
    diffOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }),
    isDragging: PropTypes.bool.isRequired
  }

  getSnapshotBeforeUpdate (prevProps) {
    const { currentOffset } = this.props
    const prevMouseX = (prevProps.currentOffset && prevProps.currentOffset.x)

    if (!currentOffset || !prevMouseX) return null

    let deg = currentOffset.x - prevMouseX
    if (deg > MAX_DRAG_DEGREE) {
      deg = MAX_DRAG_DEGREE
    } else if (deg < -MAX_DRAG_DEGREE) {
      deg = -MAX_DRAG_DEGREE
    }

    return deg
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.props.isDragging) {
      switch (this.props.type) {
        case DragTypes.SEGMENT:
        case DragTypes.PALETTE_SEGMENT:
          this.getSegmentStyle(snapshot)
          break
        case DragTypes.SEGMENT_RESIZE:
          this.handleResize()
          break
        default:
          break
      }
    }
  }

  getSegmentStyle = (deg = 0) => {
    const { currentOffset, item } = this.props

    if (!currentOffset) return

    let { x, y } = currentOffset

    if (this.props.type === DragTypes.PALETTE_SEGMENT) {
      x -= item.actualWidth * 4 // TODO: document magic number, probably TILE_SIZE * PALETTE_MULTIPLIER
      y += DRAG_OFFSET_Y_PALETTE
    }

    const transform = `translate(${x}px, ${y}px) rotateZ(${deg}deg)`
    this.floatingEl.style['transform'] = transform
    this.floatingEl.style['-webkit-transform'] = transform
  }

  unthrottledHandleResize = () => {
    // Get the difference between the dragged position and the original position
    // in order to calculate the resized width of the segment.
    // Flip the sign of the delta if the handle is on the left.
    const delta = (this.props.item.side === 'left')
      ? -this.props.diffOffset.x
      : this.props.diffOffset.x

    duringSegmentResize(delta)
  }

  handleResize = throttle(this.unthrottledHandleResize, SEGMENT_RESIZE_THROTTLE)

  render () {
    const { isDragging, item, type } = this.props

    if (!isDragging) return null

    switch (type) {
      case DragTypes.SEGMENT:
      case DragTypes.PALETTE_SEGMENT:
        return (
          <div className="segment-drag-layer">
            <div className="floating segment" ref={(ref) => { this.floatingEl = ref }}>
              <SegmentCanvas {...item} />
            </div>
          </div>
        )
      case DragTypes.SEGMENT_RESIZE:
        if (!this.props.currentOffset) return null

        return (
          <div className="drag-handle floating" style={{
            left: `${this.props.currentOffset.x}px`,
            top: `${this.props.initialOffset.y}px`
          }} />
        )
      default:
        return null
    }
  }
}

function collect (monitor) {
  return {
    item: monitor.getItem(),
    type: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    diffOffset: monitor.getDifferenceFromInitialOffset(),
    isDragging: monitor.isDragging()
  }
}

export default DragLayer(collect)(SegmentDragLayer)
