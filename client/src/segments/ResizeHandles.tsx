import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'

import { useSelector } from '../store/hooks.js'
import { Icon } from '../ui/Icon.js'
import { handleSegmentResizeStart } from './drag_and_drop.js'
import './ResizeHandles.css'

interface ResizeHandlesProps {
  sliceIndex: number
  width: number
  show: boolean
}

interface ResizeHandleProps extends ResizeHandlesProps {
  position: 'left' | 'right'
}

function ResizeHandle({
  position,
  sliceIndex,
  width,
  show,
}: ResizeHandleProps) {
  const [isActive, setIsActive] = useState(false)
  const infoBubbleHovered = useSelector((state) => state.infoBubble.mouseInside)
  const display = infoBubbleHovered ? 'none' : undefined
  const intl = useIntl()

  // To prevent drag handles from overlapping each other when the segment
  // widths are very small, we calculate an X-position adjustment when the
  // value of `width` is less than 60px. The X position adjustment follows
  // the linear equation y = 0.5x - 35 (where `x` is `width`).
  // For example:
  //    width = 36 ==> adjustX = -11px
  //    width = 12 ==> adjustX = -29px
  const adjustX = width < 60 ? `${0.5 * width - 35}px` : undefined

  const styles = {
    display,
    [position]: adjustX,
  }

  const classNames = ['resize-handle', `resize-handle-${position}`]
  if (show) {
    classNames.push('resize-handle-show')
  }
  if (isActive) {
    classNames.push('resize-handle-active')
  }

  const label =
    position === 'left'
      ? intl.formatMessage({
          id: 'segments.resize.left',
          defaultMessage: 'Resize left',
        })
      : intl.formatMessage({
          id: 'segments.resize.right',
          defaultMessage: 'Resize right',
        })

  function handlePointerDown(event: React.PointerEvent) {
    event.preventDefault()
    handleSegmentResizeStart(event.nativeEvent, sliceIndex)
    setIsActive(true)
  }

  function handleGlobalResizeEnd() {
    setIsActive(false)
  }

  useEffect(() => {
    window.addEventListener('stmx:TEMP_slice_resize_end', handleGlobalResizeEnd)

    return () => {
      window.removeEventListener(
        'stmx:TEMP_slice_resize_end',
        handleGlobalResizeEnd
      )
    }
  })

  // Note: a resize is started when holding down on these handlers,
  // but resize movement and resize end have to be triggered globally because
  // the pointer could be anywhere on the page (and not specifically on the
  // floating handler. Currently there is are global window listeners that
  // handle this. However, we should encapsulate that logic within this
  // component.

  return (
    <button
      className={classNames.join(' ')}
      style={styles}
      onPointerDown={handlePointerDown}
      aria-label={label}
    >
      <Icon name={`chevron-${position}`} size="30" />
    </button>
  )
}

export function ResizeHandles(props: ResizeHandlesProps) {
  return (
    <>
      <ResizeHandle position="left" {...props} />
      <ResizeHandle position="right" {...props} />
    </>
  )
}
