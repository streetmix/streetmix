import type * as Canvas from '@napi-rs/canvas'

const STREET_NAME_FONT_SERVER = 'Overpass'
const STREET_NAME_FONT_CLIENT = 'Overpass Variable'
const STREET_NAME_FONT_SIZE = 70
const STREET_NAME_FONT_WEIGHT = 700
const STREET_NAME_LETTER_SPACING = -0.125

/**
 * Type guard to check if context is SKRSContext2D
 */
function isSKRSContext(
  ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D
): ctx is Canvas.SKRSContext2D {
  return 'fontVariationSettings' in ctx
}

/**
 * Draws street nameplate
 *
 * @modifies {Canvas.SKRSContext2D | CanvasRenderingContext2D} ctx
 */
export function drawNameplate(
  ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D,
  text: string,
  width: number,
  scale: number
): void {
  // Save previous canvas context
  ctx.save()

  // Font settings are not the same on server vs client. Set different values
  // depending on which environment we're in.
  let fontFamily
  if (globalThis.window === undefined) {
    fontFamily = STREET_NAME_FONT_SERVER

    ctx.letterSpacing = `${STREET_NAME_LETTER_SPACING * scale}em`

    // `fontVariationSettings` is NOT standard, but is present in the
    // @napi-rs/canvas implementation of canvas context, and appears to be
    // required to set the weight correctly. See:
    // https://github.com/Brooooooklyn/canvas/issues/1158
    if (isSKRSContext(ctx)) {
      ctx.fontVariationSettings = `'wght' ${STREET_NAME_FONT_WEIGHT}`
    }
  } else {
    fontFamily = STREET_NAME_FONT_CLIENT

    ctx.letterSpacing = '-.025em'
  }

  ctx.font = `${STREET_NAME_FONT_WEIGHT} ${
    STREET_NAME_FONT_SIZE * scale
  }px ${fontFamily}`

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

  // baselineCorrection value is also different on server vs browser
  const baselineCorrection = globalThis.window === undefined ? 8 : 12
  const y = 75 + baselineCorrection

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.strokeStyle = 'transparent'
  ctx.fillStyle = 'black'
  ctx.fillText(text, x * scale, y * scale)

  // Restore previous canvas context
  ctx.restore()
}
