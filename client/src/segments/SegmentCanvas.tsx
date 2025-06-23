import React, { memo, useState, useRef, useEffect } from 'react'

import { useSelector } from '../store/hooks'
import { getSegmentVariantInfo } from './info'
import { drawSegmentContents, getVariantInfoDimensions } from './view'
import { TILE_SIZE } from './constants'
import './SegmentCanvas.css'

const CANVAS_HEIGHT = 500
const CANVAS_GROUND = 35
const CANVAS_BASELINE = CANVAS_HEIGHT - CANVAS_GROUND
const GROUND_BASELINE = CANVAS_HEIGHT - 80

interface SegmentCanvasProps {
  actualWidth: number
  type: string
  variantString: string
  randSeed: string
  elevation?: number
}

function SegmentCanvas ({
  actualWidth,
  type,
  variantString,
  randSeed,
  elevation
}: SegmentCanvasProps): React.ReactElement {
  const [firstRender, setFirstRender] = useState(true)
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const dpi = useSelector((state) => state.system.devicePixelRatio)
  const redrawCanvas = useSelector(
    (state) => state.flags.DEBUG_SEGMENT_CANVAS_RECTANGLES.value
  )

  useEffect(() => {
    if (!canvasEl.current) return
    drawSegment(canvasEl.current)

    // Normally drawSegment() on its own works just fine, except in
    // Safari where the canvases are missing assets unless something is
    // interacted with, after which all canvases are redrawn. This doesn't
    // seem to be an asset loading issue, this is a Safari bug. By putting
    // drawSegment() in a setTimeout() we're trying to force a second
    // canvas render on mount in order to unstick the Safari bug.
    window.setTimeout(() => {
      if (!canvasEl.current) return
      if (firstRender) {
        drawSegment(canvasEl.current)
        setFirstRender(false)
      }
    }, 0)

    // Only redraw on certain specific prop changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantString, actualWidth, elevation, redrawCanvas])

  function drawSegment (canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawSegmentContents(
      ctx,
      type,
      variantString,
      actualWidth,
      0,
      GROUND_BASELINE,
      elevation,
      randSeed,
      1,
      dpi
    )
  }

  // Determine the maximum width of the artwork for this segment
  const variantInfo = getSegmentVariantInfo(type, variantString)
  const dimensions = getVariantInfoDimensions(variantInfo, actualWidth)
  const totalWidth = dimensions.right - dimensions.left

  // If the graphics are wider than the width of the segment, then we will draw
  // our canvas a little bigger to make sure that the graphics aren't truncated.
  const displayWidth = totalWidth > actualWidth ? totalWidth : actualWidth

  // Determine dimensions to draw DOM element
  const elementWidth = displayWidth * TILE_SIZE
  const elementHeight = CANVAS_BASELINE

  // Determine size of canvas
  const canvasWidth = Math.round(elementWidth * dpi)
  const canvasHeight = elementHeight * dpi
  const canvasStyle = {
    width: Math.round(elementWidth),
    height: elementHeight,
    left: dimensions.left * TILE_SIZE
  }

  return (
    <canvas
      className="segment-image"
      ref={canvasEl}
      width={canvasWidth}
      height={canvasHeight}
      style={canvasStyle}
    />
  )
}

export default memo(SegmentCanvas)
