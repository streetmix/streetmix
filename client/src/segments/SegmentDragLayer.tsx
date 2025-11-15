import React, { useEffect, useRef } from 'react'
import { useDragLayer, type XYCoord } from 'react-dnd'

import { usePrevious } from '~/src/util/usePrevious'
import SegmentCanvas from './SegmentCanvas'
import { DragTypes, type DragType, type DraggedItem } from './drag_and_drop'
import './SegmentDragLayer.css'

const DRAG_OFFSET_Y_PALETTE = -340 - 150 // TODO: Document magic numbers
const MAX_DRAG_DEGREE = 20

function getDegree (
  currentOffset: XYCoord | null,
  prevOffset: XYCoord | null
): number {
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

function applySegmentStyle (
  el: HTMLDivElement | null,
  type: DragType,
  item: DraggedItem,
  currentOffset: XYCoord | null,
  deg = 0
): void {
  if (currentOffset === null || el === null) return

  let { x, y } = currentOffset
  if (type === DragTypes.PALETTE) {
    x -= item.actualWidth * 4 // TODO: document magic number, probably TILE_SIZE * PALETTE_MULTIPLIER
    y += DRAG_OFFSET_Y_PALETTE
  }

  el.style.transform = `translate(${x}px, ${y}px) rotateZ(${deg}deg)`
}

function SegmentDragLayer (): React.ReactElement {
  const floatingEl = useRef<HTMLDivElement>(null)
  const collectedProps = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    type: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
  }))
  const { item, type, currentOffset, isDragging } = collectedProps
  const prevOffset = usePrevious(currentOffset)

  useEffect(() => {
    if (isDragging) {
      const deg = getDegree(currentOffset, prevOffset)
      applySegmentStyle(
        floatingEl.current,
        type as DragType,
        item,
        currentOffset,
        deg
      )
    }
  }, [isDragging, currentOffset, prevOffset, type, item])

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
