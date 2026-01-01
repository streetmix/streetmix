import { useSelector } from '../store/hooks.js'
import Icon from '../ui/Icon.js'
import './SegmentDragHandles.css'

interface SegmentDragHandlesProps {
  width: number
}

export function SegmentDragHandles({ width }: SegmentDragHandlesProps) {
  const infoBubbleHovered = useSelector((state) => state.infoBubble.mouseInside)
  const readOnly = useSelector((state) => state.app.readOnly)

  // Do not display in read-only mode
  if (readOnly) {
    return null
  }

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
      <div
        className="drag-handle drag-handle-left"
        style={{ display, left: adjustX }}
      >
        <Icon name="chevron-left" size="30" />
      </div>
      <div
        className="drag-handle drag-handle-right"
        style={{ display, right: adjustX }}
      >
        <Icon name="chevron-right" size="30" />
      </div>
    </>
  )
}
