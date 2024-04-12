import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from '../store/hooks'
import { getSegmentVariantInfo } from './info'
import { drawSegmentContents, getVariantInfoDimensions } from './view'
import { TILE_SIZE } from './constants'
import './SegmentCanvas.scss'

const GROUND_BASELINE = 400
const CANVAS_HEIGHT = 480
const CANVAS_GROUND = 35
const CANVAS_BASELINE = CANVAS_HEIGHT - CANVAS_GROUND

interface SegmentCanvasProps {
  actualWidth: number
  type: string
  variantString: string
  randSeed: string
  groundBaseline?: number
  elevation?: number
  updatePerspective: (el: HTMLCanvasElement) => void
}

function SegmentCanvas ({
  actualWidth,
  type,
  variantString,
  randSeed,
  groundBaseline = GROUND_BASELINE,
  elevation,
  updatePerspective = () => {}
}: SegmentCanvasProps): React.ReactElement {
  const [firstRender, setFirstRender] = useState(true)
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const dpi = useSelector((state) => state.system.devicePixelRatio)
  const redrawCanvas = useSelector(
    (state) => state.flags.DEBUG_SEGMENT_CANVAS_RECTANGLES.value
  )

  useEffect(() => {
    if (!canvasEl.current) return
    updatePerspective(canvasEl.current)
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
      groundBaseline,
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

export default React.memo(SegmentCanvas)
