import React, { useRef, useEffect } from 'react'

import { useSelector } from '../store/hooks'

/**
 * Draws a polygon of the "Tognazzini zone" area.
 */
const drawPolygon = (
  canvas: HTMLCanvasElement | null,
  polygon: Array<[number, number]>
): void => {
  // Bail if polygon coordinates are empty or canvas not defined
  if (polygon.length === 0 || canvas === null) return

  const ctx = canvas.getContext('2d')

  // Bail if canvas context is not available
  if (ctx === null) return

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw the path
  ctx.strokeStyle = 'red'
  ctx.fillStyle = 'rgba(255, 0, 0, .1)'
  ctx.beginPath()
  ctx.moveTo(polygon[0][0], polygon[0][1])
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i][0], polygon[i][1])
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

function DebugHoverPolygon (): React.ReactElement | null {
  // When the window / viewport resizes, set the width and
  // height of the canvas element.
  const el = useRef<HTMLCanvasElement>(null)

  const enabled = useSelector(
    (state) => state.flags.INFO_BUBBLE_HOVER_POLYGON.value || false
  )
  const hoverPolygon = useSelector((state) => state.infoBubble.hoverPolygon)

  const handleResize = (): void => {
    if (!el.current) return

    el.current.width = window.innerWidth
    el.current.height = window.innerHeight
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  })

  // Draw the polygon area.
  useEffect(() => {
    if (enabled) {
      drawPolygon(el.current, hoverPolygon)
    }
  }, [hoverPolygon, enabled])

  // Render component if enabled.
  if (enabled) {
    return (
      <div className="debug-hover-polygon">
        <canvas
          width={window.innerWidth}
          height={window.innerHeight}
          ref={el}
        />
      </div>
    )
  }

  // Bail if disabled
  return null
}

export default DebugHoverPolygon
