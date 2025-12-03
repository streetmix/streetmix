import type * as Canvas from '@napi-rs/canvas'
import type { Street } from '@streetmix/types'

const STREET_NAME_FONT = 'Overpass'
const STREET_NAME_FONT_SIZE = 70
const STREET_NAME_FONT_WEIGHT = '700'
const STREET_NAME_LETTER_SPACING = -0.125

/**
 * Draws street nameplate
 *
 * @modifies {Canvas.SKRSContext2D} ctx
 */
export function drawNameplate(
  ctx: Canvas.SKRSContext2D,
  street: Street,
  width: number,
  scale: number
): void {
  // Save previous canvas context
  ctx.save()

  // TODO: locales
  let text = street.name ?? 'Unnamed St' // formatMessage('street.default-name', 'Unnamed St')

  // Try to match letter-spacing adjustment on the front end
  // For whatever reason the numbers are not exactly the same
  ctx.letterSpacing = `${STREET_NAME_LETTER_SPACING * scale}em`
  ctx.font = `normal ${STREET_NAME_FONT_WEIGHT} ${
    STREET_NAME_FONT_SIZE * scale
  }px ${STREET_NAME_FONT}`
  // This is NOT standard, but is currently implemented this way in @napi-rs/canvas
  ctx.fontVariationSettings = `'wght' ${STREET_NAME_FONT_WEIGHT}`

  // Handles long names
  // Measurements need to be devided by `scale` because they are rendered
  // at scaled font size
  let measurement = ctx.measureText(text).width / scale
  let needToBeElided = false
  while (measurement > width - 200) {
    text = text.substring(0, text.length - 1)
    measurement = ctx.measureText(text).width / scale
    needToBeElided = true
  }
  if (needToBeElided) {
    // Append ellipsis, then re-measure the text
    text += '…'
    measurement = ctx.measureText(text).width / scale
  }

  // Nameplate background
  ctx.fillStyle = 'white'
  const x1 = width / 2 - (measurement / 2 + 45)
  const x2 = width / 2 + (measurement / 2 + 45)
  const y1 = 75 - 60
  const y2 = 75 + 60
  ctx.fillRect(x1 * scale, y1 * scale, (x2 - x1) * scale, (y2 - y1) * scale)

  // Nameplate border
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 5 * scale
  ctx.strokeRect(
    (x1 + 5 * 2) * scale,
    (y1 + 5 * 2) * scale,
    (x2 - x1 - 5 * 4) * scale,
    (y2 - y1 - 5 * 4) * scale
  )

  // Street name text
  const x = width / 2

  // There is a different baselineCorrection value on the backend
  // compared to front end version
  const baselineCorrection = 8
  const y = 75 + baselineCorrection

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.strokeStyle = 'transparent'
  ctx.fillStyle = 'black'
  ctx.fillText(text, x * scale, y * scale)

  // Restore previous canvas context
  ctx.restore()
}
