import { GROUND_BASELINE_HEIGHT, TILE_SIZE } from './constants.js'

import type * as Canvas from '@napi-rs/canvas'
import type { Street } from '@streetmix/types'

const LABEL_BACKGROUND = 'rgb(216, 211, 203)'

const SEGMENT_NAME_FONT = 'Geist Sans'
const SEGMENT_NAME_FONT_SIZE = 12
const SEGMENT_NAME_FONT_WEIGHT = '400'

/**
 * Draws segment label background.
 *
 * @modifies {CanvasRenderingContext2D} ctx
 */
export function drawSegmentLabelBackground (
  ctx: Canvas.SKRSContext2D,
  width: number,
  height: number,
  groundLevel: number,
  scale: number
): void {
  ctx.save()

  ctx.fillStyle = LABEL_BACKGROUND
  ctx.fillRect(
    0,
    (groundLevel + GROUND_BASELINE_HEIGHT) * scale,
    width * scale,
    (height - groundLevel - GROUND_BASELINE_HEIGHT) * scale
  )

  ctx.restore()
}

/**
 * Draws segment labels.
 *
 * @modifies {CanvasRenderingContext2D} ctx
 */
export function drawSegmentLabels (
  ctx: Canvas.SKRSContext2D,
  streetData: Street,
  groundLevel: number,
  offsetLeft: number,
  scale: number
): void {
  const street = streetData.data.street

  ctx.save()

  ctx.lineWidth = 0.25 * scale

  ctx.font = `normal ${SEGMENT_NAME_FONT_WEIGHT} ${
    SEGMENT_NAME_FONT_SIZE * scale
  }px ${SEGMENT_NAME_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.strokeStyle = 'black'
  ctx.fillStyle = 'black'

  street.segments.forEach((segment, i) => {
    const availableWidth = segment.width * TILE_SIZE

    let left = offsetLeft

    if (i === 0) {
      left--
    }

    // Left line
    drawLine(
      ctx,
      left,
      groundLevel + GROUND_BASELINE_HEIGHT,
      left,
      groundLevel + 125,
      scale
    )

    const x = offsetLeft + availableWidth / 2

    // Width label
    // Temp: coerce width number to string for rendering
    let text: string = segment.width + '' // prettifyWidth(segment.width, street.units)
    let textWidth = ctx.measureText(text).width / scale

    while (textWidth > availableWidth - 10 && text.includes(' ')) {
      text = text.substring(0, text.lastIndexOf(' '))
      textWidth = ctx.measureText(text).width / scale
    }

    ctx.fillText(text, x * scale, (groundLevel + 60) * scale)

    // Segment name label
    const name = segment.label ?? 'placeholder' // ?? getLocaleSegmentName(segment.type, segment.variantString)
    const nameWidth = ctx.measureText(name).width / scale

    if (nameWidth <= availableWidth - 10) {
      ctx.fillText(name, x * scale, (groundLevel + 83) * scale)
    }

    offsetLeft += availableWidth
  })

  // Final right-hand side line
  const left = offsetLeft + 1
  drawLine(
    ctx,
    left,
    groundLevel + GROUND_BASELINE_HEIGHT,
    left,
    groundLevel + 125,
    scale
  )

  ctx.restore()
}

function drawLine (
  ctx: Canvas.SKRSContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  scale: number
): void {
  x1 *= scale
  y1 *= scale
  x2 *= scale
  y2 *= scale

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.restore()
}

// function drawArrowLine (ctx, x1, y1, x2, y2, text, dpi) {
//   x1 += 2
//   x2 -= 2

//   drawLine(ctx, x1, y1, x2, y2, dpi)

//   if (text) {
//     ctx.font = 12 * dpi + 'px Arial'
//     ctx.textAlign = 'center'
//     ctx.fillText(text, ((x1 + x2) / 2) * dpi, y1 * dpi - 10)
//   }
// }
