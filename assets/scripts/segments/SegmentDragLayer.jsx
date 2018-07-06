import React from 'react'
import PropTypes from 'prop-types'
import { DragLayer } from 'react-dnd'
import SegmentCanvas from './SegmentCanvas'

const DRAG_OFFSET_Y_PALETTE = -340 - 150
const MAX_DRAG_DEGREE = 20

class SegmentDragLayer extends React.PureComponent {
  static propTypes = {
    isDragging: PropTypes.bool.isRequired,
    currentOffset: PropTypes.object,
    item: PropTypes.object
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
      this.getSegmentStyle(snapshot)
    }
  }

  getSegmentStyle = (deg = 0) => {
    const { currentOffset, item } = this.props

    if (!currentOffset) return

    let { x, y } = currentOffset
    if (item.forPalette) {
      x -= item.width / 3
      y += DRAG_OFFSET_Y_PALETTE
    }

    const transform = `translate(${x}px, ${y}px)`
    this.floatingEl.style['transform'] = transform
    this.floatingEl.style['-webkit-transform'] = transform
  }

  render () {
    const { isDragging, item } = this.props

    if (!isDragging) return null

    return (
      <div className="segment-drag-layer">
        <div className="floating segment" ref={(ref) => { this.floatingEl = ref }}>
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
