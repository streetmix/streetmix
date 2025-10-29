import React, { useRef, useEffect } from 'react'

import { useSelector } from '~/src/store/hooks'
import { CANVAS_HEIGHT, GROUND_BASELINE_HEIGHT, TILE_SIZE } from './constants'
import './TestSlope.css'

import { calculateSlope } from './slope'
import { getElevation } from './view'
import type { Segment } from '@streetmix/types'

interface Props {
  slice: Segment
}

function estimateCoord (elev: number, scale: number): number {
  return getElevation(elev) * scale
}

function drawSegment (
  canvas: HTMLCanvasElement,
  leftElevation: number,
  rightElevation: number,
  dpi: number
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // TODO: redefine magic number in a less hacky way
  const magicNumber = dpi * GROUND_BASELINE_HEIGHT
  const groundLevel =
    magicNumber + estimateCoord(Math.min(leftElevation, rightElevation), dpi)

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // These rectangles are telling us that we're drawing at the right places.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.strokeStyle = 'red'
  ctx.lineWidth = 2
  // Start at the bottom left corner and use a negative number to draw upwards
  ctx.fillRect(0, canvas.height, canvas.width, groundLevel * -1)
  ctx.strokeRect(0, canvas.height, canvas.width, groundLevel * -1)

  // Draw a slope
  ctx.beginPath()
  ctx.moveTo(0, canvas.height - groundLevel)
  ctx.moveTo(0, canvas.height - estimateCoord(leftElevation, dpi) - magicNumber)
  ctx.lineTo(
    canvas.width,
    canvas.height - estimateCoord(rightElevation, dpi) - magicNumber
  )
  ctx.lineTo(canvas.width, canvas.height - groundLevel)
  ctx.fill()
  ctx.stroke()
}

function TestSlope ({ slice }: Props): React.ReactNode | null {
  const street = useSelector((state) => state.street)
  const dpi = useSelector((state) => state.system.devicePixelRatio)
  const debug = useSelector((state) => state.flags.DEBUG_SLICE_SLOPE.value)
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const sliceIndex = street.segments.findIndex((s) => s.id === slice.id)
  const slopeData = calculateSlope(street, sliceIndex)

  useEffect(() => {
    if (!canvasEl.current || slopeData === null) return

    if (slice.slope) {
      const { leftElevation, rightElevation } = slopeData
      drawSegment(canvasEl.current, leftElevation, rightElevation, dpi)
    }
  }, [
    slice.variantString,
    slice.width,
    slice.elevation,
    slice.slope,
    slopeData,
    dpi
  ])

  // Bail if slice is not sloped, or it has been removed
  if (slice.slope !== true || slopeData === null) return null

  const { slope, ratio, warnings } = slopeData

  // Determine dimensions to draw DOM element
  const elementWidth = slice.width * TILE_SIZE
  const elementHeight = CANVAS_HEIGHT

  // Determine size of canvas
  const canvasWidth = Math.round(elementWidth * dpi)
  const canvasHeight = elementHeight * dpi
  const canvasStyle = {
    width: Math.round(elementWidth),
    height: elementHeight
  }

  const styles = {
    color: 'inherit'
  }
  // TODO: handle slope exceeded for paths
  if (warnings.slopeExceededBerm) {
    styles.color = 'red'
  }

  return (
    <div className="test-slope-container">
      {debug && (
        <div className="slope-debug">
          <p style={styles}>{slope} %</p>
          <p style={styles}>{ratio}:1</p>
        </div>
      )}
      <canvas
        ref={canvasEl}
        width={canvasWidth}
        height={canvasHeight}
        style={canvasStyle}
      />
    </div>
  )
}

export default TestSlope
