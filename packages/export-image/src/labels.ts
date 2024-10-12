import { GROUND_BASELINE_HEIGHT, TILE_SIZE } from './constants.js'

import type * as Canvas from '@napi-rs/canvas'
import type { Street, UnitsSetting } from '@streetmix/types'

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
    const text = prettifyWidth(segment.width, street.units)
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

/**
 * Simplified prettifyWidth() functions.
 * Does not handle locale.
 */
const SETTINGS_UNITS_IMPERIAL = 1
const IMPERIAL_CONVERSION_RATE = 0.3048
const IMPERIAL_PRECISION = 3
const METRIC_PRECISION = 3

const IMPERIAL_VULGAR_FRACTIONS: Record<number, string> = {
  0.125: '⅛',
  0.25: '¼',
  0.375: '⅜',
  0.5: '½',
  0.625: '⅝',
  0.75: '¾',
  0.875: '⅞'
}

// https://www.jacklmoore.com/notes/rounding-in-javascript/
function round (value: number, decimals: number): number {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals)
}

function prettifyWidth (width: number, units: UnitsSetting): string {
  let widthText = ''

  if (units === SETTINGS_UNITS_IMPERIAL) {
    // Convert metric value to imperial measurement
    // This handles precision and rounding to nearest eighth
    const imperialWidth = convertMetricMeasurementToImperial(width)

    // Convert numerical value to string with vulgar fractions, if any
    widthText = stringifyImperialValueWithFractions(imperialWidth)

    // Append prime mark
    // This character may not exist in all fonts.
    widthText += '′'
  } else {
    // For metric values, only round to required precision
    // Then append the unit (with non-breaking space)
    widthText = round(width, METRIC_PRECISION) + ' m'
  }

  return widthText
}

/**
 * Given a measurement, assumed to be in imperial units,
 * return a value rounded to the nearest (up or down) eighth.
 */
function convertMetricMeasurementToImperial (value: number): number {
  const converted = round(value / IMPERIAL_CONVERSION_RATE, IMPERIAL_PRECISION)

  // Return a value rounded to the nearest eighth
  return Math.round(converted * 8) / 8
}

/**
 * Given a measurement value (assuming imperial units), return
 * a string formatted to use vulgar fractions, e.g. .5 => ½
 */
export function stringifyImperialValueWithFractions (value: number): string {
  // Determine if there is a vulgar fraction to display
  const floor = Math.floor(value)
  const decimal = value - floor
  const fraction = IMPERIAL_VULGAR_FRACTIONS[decimal]

  // If a fraction exists:
  if (fraction !== undefined) {
    // For values less than 1, return just the fractional part.
    if (value < 1) {
      return fraction
    } else {
      // Otherwise, return both the integer and fraction
      return floor.toString() + fraction
    }
  }

  // Otherwise, just return the stringified value without fractions
  return value.toString()
}
