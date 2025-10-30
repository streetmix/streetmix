import React, { useRef, useEffect } from 'react'

import { images } from '~/src/app/load_resources'
import { useSelector } from '~/src/store/hooks'
import { CANVAS_HEIGHT, GROUND_BASELINE_HEIGHT, TILE_SIZE } from './constants'
import './TestSlope.css'

import { calculateSlope } from './slope'
import { getElevation } from './view'
import { getSegmentVariantInfo, getSpriteDef } from './info'
import type { Segment } from '@streetmix/types'

interface Props {
  slice: Segment
}

function getCanvasElevation (elev: number, scale: number): number {
  return getElevation(elev) * scale + GROUND_BASELINE_HEIGHT * scale
}

function drawSegment (
  canvas: HTMLCanvasElement,
  slice: Segment,
  leftElevation: number,
  rightElevation: number,
  dpi: number
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const variantInfo = getSegmentVariantInfo(slice.type, slice.variantString)
  const graphics = variantInfo.graphics
  let ground
  if (Array.isArray(graphics.repeat)) {
    const found = graphics.repeat.find((id) => id.startsWith('ground--'))
    ground = found
  } else {
    ground = graphics.repeat
  }
  const spriteDef = getSpriteDef(ground)
  const spriteImage = images.get(spriteDef.id)
  const pattern = ctx.createPattern(spriteImage.img, 'repeat')

  // TODO: scale the pattern according to image scale
  // This will only be important if we have patterns that aren't solid colors
  // pattern.setTransform(new DOMMatrix().scale(1))

  // Save context state before drawing ground pattern
  ctx.save()

  // Clear previous context
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw a shape representing the ground
  ctx.beginPath()
  // Bottom left
  ctx.moveTo(0, canvas.height)
  // Top left
  ctx.lineTo(0, canvas.height - getCanvasElevation(leftElevation, dpi))
  // Top right
  ctx.lineTo(
    canvas.width,
    canvas.height - getCanvasElevation(rightElevation, dpi)
  )
  // Bottom right
  ctx.lineTo(canvas.width, canvas.height)
  ctx.closePath()

  // Clip our fill to this shape
  ctx.clip()

  // Then fill the clipped shape
  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Restore context state
  ctx.restore()
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
      drawSegment(canvasEl.current, slice, leftElevation, rightElevation, dpi)
    } else {
      // If not sloped, draw slice's inherent flat elevation
      drawSegment(
        canvasEl.current,
        slice,
        slice.elevation,
        slice.elevation,
        dpi
      )
    }
  }, [slice, slopeData, dpi])

  // Bail if slice has been removed
  if (slopeData === null) return null

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
