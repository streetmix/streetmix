import { formatNumber } from './number_format.js'
import { round } from './number.js'

import type { MeasurementValues, UnitsSetting } from '@streetmix/types'

/**
 * prettifyWidth() and associated functions are similar to in width_units.ts
 */
const SETTINGS_UNITS_METRIC = 0
const SETTINGS_UNITS_IMPERIAL = 1
const IMPERIAL_CONVERSION_RATE = 0.3048
const IMPERIAL_PRECISION = 3
const METRIC_PRECISION = 3

const IMPERIAL_VULGAR_FRACTIONS: Record<string, string> = {
  // Do not change these strings to numbers
  '.125': '⅛',
  '.25': '¼',
  '.375': '⅜',
  '.5': '½',
  '.625': '⅝',
  '.75': '¾',
  '.875': '⅞',
}

export function prettifyWidth(
  width: number,
  units: UnitsSetting,
  locale: string
): string {
  let widthText: string

  if (units === SETTINGS_UNITS_IMPERIAL) {
    // Convert metric value to imperial measurement
    // This handles precision and rounding to nearest eighth
    const imperialWidth = convertMetricMeasurementToImperial(width)

    // Convert numerical value to string with vulgar fractions, if any
    widthText = stringifyImperialValueWithFractions(imperialWidth, locale)

    // Append prime mark
    // This character may not exist in all fonts.
    widthText += '′'
  } else {
    // For metric values, only round to required precision
    // Then append the unit (with non-breaking space)
    widthText = stringifyMeasurementValue(width, SETTINGS_UNITS_METRIC, locale)

    // Locale-specific units
    switch (locale) {
      // In Russian, the Cyrillic м is common in vernacular usage.
      // This is in defiance of SI, but should be friendlier.
      case 'ru':
        widthText += ' м'
        break
      // In Arabic, use the same character that the USDM uses for
      // metric units
      case 'ar':
        widthText += ' م'
        break
      default:
        widthText += ' m'
        break
    }
  }

  return widthText
}

/**
 * Returns a measurement value as a locale-sensitive string without units
 * or formatting, and converts to the desired units, if necessary.
 * Used primarily when converting input box values to a simple number format
 */
export function stringifyMeasurementValue(
  value: number,
  units: UnitsSetting,
  locale: string
): string {
  let string: string

  if (!value) return '0'

  // Force the use of Western Arabic numerals in Arabic locale
  if (locale === 'ar') {
    locale += '-u-nu-latn'
  }

  if (units === SETTINGS_UNITS_IMPERIAL) {
    string = formatNumber(value, locale, {
      style: 'decimal',
      maximumFractionDigits: IMPERIAL_PRECISION,
    })
  } else {
    string = formatNumber(value, locale, {
      style: 'decimal',
      maximumFractionDigits: METRIC_PRECISION,
    })
  }

  return string
}

/**
 * Given a measurement value (stored internally in Streetmix as metric units),
 * return an imperial quantity up to three decimal point precision.
 */
export function convertMetricMeasurementToImperial(value: number): number {
  return roundToNearestEighth(
    round(value / IMPERIAL_CONVERSION_RATE, IMPERIAL_PRECISION)
  )
}

/**
 * Given a measurement, assumed to be in imperial units,
 * return a metric value up to three decimal point precision.
 */
export function convertImperialMeasurementToMetric(value: number): number {
  return round(value * IMPERIAL_CONVERSION_RATE, METRIC_PRECISION)
}

/**
 * Given a `width` definition (an object containing both metric and imperial
 * width values), return a numerical value in metric. If `units` is metric
 * then return the metric value as is. If `units` is imperial, convert the
 * imperial value to metric and return it.
 */
export function getWidthInMetric(
  width: MeasurementValues,
  units: UnitsSetting
): number {
  if (units === SETTINGS_UNITS_IMPERIAL) {
    return convertImperialMeasurementToMetric(width.imperial)
  } else {
    return width.metric
  }
}

/**
 * Given a measurement, assumed to be in imperial units,
 * return a value rounded to the nearest (up or down) eighth.
 */
export function roundToNearestEighth(value: number): number {
  return Math.round(value * 8) / 8
}

/**
 * Given a measurement value (assuming imperial units), return
 * a string formatted to use vulgar fractions, e.g. .5 => ½
 */
export function stringifyImperialValueWithFractions(
  value: number,
  locale: string
): string {
  // Determine if there is a vulgar fraction to display
  const floor = Math.floor(value)
  const decimal = value - floor
  const key = decimal.toString().replace(/^0/, '')
  const fraction = IMPERIAL_VULGAR_FRACTIONS[key]

  // If a fraction exists:
  if (fraction !== undefined) {
    // For values less than 1, return just the fractional part.
    if (value < 1) {
      return fraction
    } else {
      // Otherwise, return both the integer and fraction
      return (
        stringifyMeasurementValue(floor, SETTINGS_UNITS_IMPERIAL, locale) +
        fraction
      )
    }
  }

  // Otherwise, just return the stringified value without fractions
  return stringifyMeasurementValue(value, SETTINGS_UNITS_IMPERIAL, locale)
}
