import React from 'react'
import PropTypes from 'prop-types'
import { DragLayer } from 'react-dnd'
import SegmentCanvas from './SegmentCanvas'

const DRAG_OFFSET_Y_PALETTE = -340 - 150

class SegmentDragLayer extends React.Component {
  static propTypes = {
    isDragging: PropTypes.bool.isRequired,
    currentOffset: PropTypes.number,
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

    const layerStyle = {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: 200,
      left: 0,
      top: 0,
      width: '100%',
      height: '100%'
    }

    if (!isDragging) return null

    return (
      <div style={layerStyle}>
        <div className="floating segment first-drag-move" style={this.getSegmentStyle()}>
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
