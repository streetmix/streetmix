import React from 'react'

import { useSelector } from '../store/hooks'
import Icon from '../ui/Icon'
import './SegmentDragHandles.css'

interface SegmentDragHandlesProps {
  width: number
}

function SegmentDragHandles ({
  width
}: SegmentDragHandlesProps): React.ReactElement {
  const infoBubbleHovered = useSelector((state) => state.infoBubble.mouseInside)
  const display = infoBubbleHovered ? 'none' : undefined

  // To prevent drag handles from overlapping each other when the segment
  // widths are very small, we calculate an X-position adjustment when the
  // value of `width` is less than 60px. The X position adjustment follows
  // the linear equation y = 0.5x - 35 (where `x` is `width`).
  // For example:
  //    width = 36 ==> adjustX = -11px
  //    width = 12 ==> adjustX = -29px
  const adjustX = width < 60 ? `${0.5 * width - 35}px` : undefined

  return (
    <>
      <span
        className="drag-handle drag-handle-left"
        style={{ display, left: adjustX }}
      >
        <Icon name="chevron-left" />
      </span>
      <span
        className="drag-handle drag-handle-right"
        style={{ display, right: adjustX }}
      >
        <Icon name="chevron-right" />
      </span>
    </>
  )
}

export default SegmentDragHandles
