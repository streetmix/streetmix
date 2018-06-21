import React from 'react'
import PropTypes from 'prop-types'
import { DragLayer } from 'react-dnd'
import SegmentCanvas from './SegmentCanvas'

const DRAG_OFFSET_Y_PALETTE = -340 - 150

class SegmentDragLayer extends React.Component {
  static propTypes = {
    isDragging: PropTypes.bool.isRequired,
    currentOffset: PropTypes.object,
    item: PropTypes.object
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

    const transform = `translate(${x}px, ${y}px)`
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
