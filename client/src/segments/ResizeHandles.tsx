import { useSelector } from '../store/hooks.js'
import { Icon } from '../ui/Icon.js'
import { handleSegmentResizeStart } from './drag_and_drop.js'
import './ResizeHandles.css'

interface ResizeHandlesProps {
  width: number
}

export function ResizeHandles({ width }: ResizeHandlesProps) {
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

  function handlePointerDown(event: React.MouseEvent) {
    event.preventDefault()
    handleSegmentResizeStart(event)
  }

  // Note: a resize is started when holding down on these handlers,
  // but resize movement and resize end have to be triggered globally because
  // the pointer could be anywhere on the page (and not specifically on the
  // floating handler. Currently there is are global window listeners that
  // handle this. However, we should encapsulate that logic within this
  // component.

  return (
    <>
      <div
        className="resize-handle resize-handle-left"
        style={{ display, left: adjustX }}
        onPointerDown={handlePointerDown}
      >
        <Icon name="chevron-left" size="30" />
      </div>
      <div
        className="resize-handle resize-handle-right"
        style={{ display, right: adjustX }}
        onPointerDown={handlePointerDown}
      >
        <Icon name="chevron-right" size="30" />
      </div>
    </>
  )
}
