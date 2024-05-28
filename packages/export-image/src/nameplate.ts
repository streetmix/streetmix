import type * as Canvas from '@napi-rs/canvas'
import type { Street } from '@streetmix/types'

const STREET_NAME_FONT = 'Overpass'
const STREET_NAME_FONT_SIZE = 70
const STREET_NAME_FONT_WEIGHT = '700'

/**
 * Draws street nameplate
 *
 * @modifies {Canvas.SKRSContext2D} ctx
 */
export function drawNameplate (
  ctx: Canvas.SKRSContext2D,
  street: Street,
  width: number,
  scale: number
): void {
  // Save previous canvas context
  ctx.save()

  // TODO: locales
  let text = street.name ?? 'Unnamed St' // formatMessage('street.default-name', 'Unnamed St')

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '-0.225em' // Different from front-end, very slightly smaller spacing
  ctx.font = `normal ${STREET_NAME_FONT_WEIGHT} ${
    STREET_NAME_FONT_SIZE * scale
  }px ${STREET_NAME_FONT}`

  // Handles long names
  let measurement = ctx.measureText(text)
  let needToBeElided = false
  while (measurement.width > width - 200 * scale) {
    text = text.substring(0, text.length - 1)
    measurement = ctx.measureText(text)
    needToBeElided = true
  }
  if (needToBeElided) {
    // Append ellipsis, then re-measure the text
    text += '…'
    measurement = ctx.measureText(text)
  }

  // Nameplate background
  ctx.fillStyle = 'white'
  const x1 = width / 2 - (measurement.width / 2 + 45 * scale)
  const x2 = width / 2 + (measurement.width / 2 + 45 * scale)
  const y1 = (75 - 60) * scale
  const y2 = (75 + 60) * scale
  ctx.fillRect(x1, y1, x2 - x1, y2 - y1)

  // Nameplate border
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 5 * scale
  ctx.strokeRect(
    x1 + 5 * scale * 2,
    y1 + 5 * scale * 2,
    x2 - x1 - 5 * scale * 4,
    y2 - y1 - 5 * scale * 4
  )

  // Street name text
  const x = width / 2

  // There is a different baselineCorrection value on the backend
  // compared to front end version
  const baselineCorrection = 8
  const y = (75 + baselineCorrection) * scale

  ctx.strokeStyle = 'transparent'
  ctx.fillStyle = 'black'
  ctx.fillText(text, x, y)

  // Restore previous canvas context
  ctx.restore()
}
