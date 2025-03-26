import React, { useEffect, useRef } from 'react'
import { useDragLayer } from 'react-dnd'

import { usePrevious } from '~/src/util/usePrevious'
import SegmentCanvas from './SegmentCanvas'
import { Types } from './drag_and_drop'
import './SegmentDragLayer.css'

const DRAG_OFFSET_Y_PALETTE = -340 - 150
const MAX_DRAG_DEGREE = 20

function SegmentDragLayer () {
  const floatingEl = useRef(null)
  const collectedProps = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    type: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
  }))
  const { item, type, currentOffset, isDragging } = collectedProps
  const prevProps = usePrevious(collectedProps)

  function getDegree (currentOffset) {
    const prevOffset = prevProps.currentOffset

    let deg
    if (currentOffset === null || prevOffset === null) {
      deg = 0
    } else {
      deg = currentOffset.x - prevOffset.x
    }

    if (deg > MAX_DRAG_DEGREE) {
      deg = MAX_DRAG_DEGREE
    } else if (deg < -MAX_DRAG_DEGREE) {
      deg = -MAX_DRAG_DEGREE
    }

    return deg
  }

  function applySegmentStyle (deg = 0) {
    if (currentOffset === null || floatingEl === null) return

    let { x, y } = currentOffset
    if (type === Types.PALETTE_SEGMENT) {
      x -= item.actualWidth * 4 // TODO: document magic number, probably TILE_SIZE * PALETTE_MULTIPLIER
      y += DRAG_OFFSET_Y_PALETTE
    }

    const transform = `translate(${x}px, ${y}px) rotateZ(${deg}deg)`
    floatingEl.current.style.transform = transform
    floatingEl.current.style['-webkit-transform'] = transform
  }

  useEffect(() => {
    if (isDragging) {
      applySegmentStyle(getDegree(currentOffset))
    }
  }, [currentOffset, isDragging])

  return (
    <div className="segment-drag-layer">
      {isDragging && (
        <div className="floating segment" ref={floatingEl}>
          <SegmentCanvas randSeed={item.id} {...item} />
        </div>
      )}
    </div>
  )
}

export default SegmentDragLayer
