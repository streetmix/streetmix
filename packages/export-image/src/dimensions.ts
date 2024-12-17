import { round } from '@streetmix/utils'
import type { UnitsSetting } from '@streetmix/types'

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

export function prettifyWidth (width: number, units: UnitsSetting): string {
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
function stringifyImperialValueWithFractions (value: number): string {
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
