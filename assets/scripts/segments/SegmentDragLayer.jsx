import React from 'react'
import PropTypes from 'prop-types'
import { DragLayer } from 'react-dnd'
import SegmentCanvas from './SegmentCanvas'
import { Types } from './drag_and_drop'
import './SegmentDragLayer.scss'

const DRAG_OFFSET_Y_PALETTE = -340 - 150
const MAX_DRAG_DEGREE = 20

class SegmentDragLayer extends React.PureComponent {
  static propTypes = {
    isDragging: PropTypes.bool.isRequired,
    currentOffset: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    }),
    item: PropTypes.object,
    type: PropTypes.string
  }

  floatingEl = React.createRef()

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
      this.getSegmentStyle(snapshot)
    }
  }

  getSegmentStyle = (deg = 0) => {
    const { currentOffset, item } = this.props

    if (!currentOffset) return

    let { x, y } = currentOffset

    if (this.props.type === Types.PALETTE_SEGMENT) {
      x -= item.actualWidth * 4 // TODO: document magic number, probably TILE_SIZE * PALETTE_MULTIPLIER
      y += DRAG_OFFSET_Y_PALETTE
    }

    const transform = `translate(${x}px, ${y}px) rotateZ(${deg}deg)`
    this.floatingEl.current.style['transform'] = transform
    this.floatingEl.current.style['-webkit-transform'] = transform
  }

  render () {
    const { isDragging, item } = this.props

    return (
      <div className="segment-drag-layer">
        {isDragging && (
          <div className="floating segment" ref={this.floatingEl}>
            <SegmentCanvas {...item} />
          </div>
        )}
      </div>
    )
  }
}

function collect (monitor) {
  return {
    item: monitor.getItem(),
    type: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
  }
}

export default DragLayer(collect)(SegmentDragLayer)
