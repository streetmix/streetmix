import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '../users/constants'
import store from '../store'
import { formatNumber } from './number_format'
import type { UnitsSetting } from '@streetmix/types'

const IMPERIAL_CONVERSION_RATE = 3.2808
const METRIC_PRECISION = 3
const IMPERIAL_PRECISION = 3

const WIDTH_INPUT_CONVERSION = [
  { text: 'm', multiplier: 1 },
  { text: 'м', multiplier: 1 },
  { text: 'dm', multiplier: 1 / 10 },
  { text: 'cm', multiplier: 1 / 100 },
  { text: 'mm', multiplier: 1 / 1000 },
  { text: '"', multiplier: 1 / IMPERIAL_CONVERSION_RATE / 12 },
  { text: '″', multiplier: 1 / IMPERIAL_CONVERSION_RATE / 12 },
  { text: 'in', multiplier: 1 / IMPERIAL_CONVERSION_RATE / 12 },
  { text: 'in.', multiplier: 1 / IMPERIAL_CONVERSION_RATE / 12 },
  { text: 'inch', multiplier: 1 / IMPERIAL_CONVERSION_RATE / 12 },
  { text: 'inches', multiplier: 1 / IMPERIAL_CONVERSION_RATE / 12 },
  { text: "'", multiplier: 1 / IMPERIAL_CONVERSION_RATE },
  { text: '′', multiplier: 1 / IMPERIAL_CONVERSION_RATE },
  { text: 'ft', multiplier: 1 / IMPERIAL_CONVERSION_RATE },
  { text: 'ft.', multiplier: 1 / IMPERIAL_CONVERSION_RATE },
  { text: 'feet', multiplier: 1 / IMPERIAL_CONVERSION_RATE }
]

const IMPERIAL_VULGAR_FRACTIONS: Record<string, string> = {
  '.125': '⅛',
  '.25': '¼',
  '.375': '⅜',
  '.5': '½',
  '.625': '⅝',
  '.75': '¾',
  '.875': '⅞'
}

// https://www.jacklmoore.com/notes/rounding-in-javascript/
export function round (value: number, decimals: number): number {
  // Can't use exponentiation operators either, it'll still produce rounding
  // errors, so we stick with concatenating exponents as a string then
  // casting to Number to satisfy the type-checker.
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals)
}

/**
 * Processes a string width input from user, returns a number
 */
export function processWidthInput (
  widthInput: string,
  units: UnitsSetting
): number {
  // Normalize certain input quirks. Spaces (more common at end or beginning
  // of input) go away, and comma-based decimals turn into period-based
  // decimals
  widthInput = widthInput.replace(/ /g, '')
  widthInput = widthInput.replace(/,/g, '.')

  // Replace vulgar fractions, such as ¼, with its decimal equivalent
  for (const i in IMPERIAL_VULGAR_FRACTIONS) {
    if (widthInput.includes(IMPERIAL_VULGAR_FRACTIONS[i])) {
      widthInput = widthInput.replace(
        new RegExp(IMPERIAL_VULGAR_FRACTIONS[i]),
        i
      )
    }
  }

  let width: number

  // The conditional makes sure we only split and parse separately when the
  // input includes ' as any character except the last
  if (
    widthInput.includes("'") &&
    widthInput.length > widthInput.indexOf("'") + 1
  ) {
    const splitInput = widthInput.split("'")
    // Add the ' to the first value so the parser knows to convert in feet,
    // not in unitless, when in metric
    splitInput[0] += "'"

    // Assuming anything coming after feet is going to be inches
    if (!splitInput[1].includes('"')) {
      splitInput[1] += '"'
    }

    width =
      parseStringForUnits(splitInput[0], units) +
      parseStringForUnits(splitInput[1], units)
  } else {
    width = parseStringForUnits(widthInput, units)
  }

  return width
}

/**
 * Formats a width to a "pretty" output and converts the value to the user's
 * current units settings (imperial or metric).
 */
export function prettifyWidth (
  width: number,
  units: UnitsSetting,
  locale: string
): string {
  let widthText = ''

  // LEGACY: Not all uses of this function pass in locale.
  // This is _not_ an optional value. After TypeScript conversion,
  // missing this parameter throws an error.
  if (!locale) {
    locale = store.getState().locale.locale
  }

  switch (units) {
    case SETTINGS_UNITS_IMPERIAL: {
      const imperialWidth = convertMetricMeasurementToImperial(width)
      const roundedWidth = roundToNearestEighth(imperialWidth)
      widthText = getImperialMeasurementWithVulgarFractions(
        roundedWidth,
        locale
      ) // also converts to string
      widthText += '′'
      break
    }
    case SETTINGS_UNITS_METRIC:
    default:
      widthText = stringifyMeasurementValue(
        width,
        SETTINGS_UNITS_METRIC,
        locale
      )

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

      break
  }

  return widthText
}

/**
 * Returns a measurement value as a locale-sensitive string without units
 * or formatting, and converts to the desired units, if necessary.
 * Used primarily when converting input box values to a simple number format
 */
export function stringifyMeasurementValue (
  value: number,
  units: UnitsSetting,
  locale: string
): string {
  let string = ''

  if (!value) return '0'

  // Force the use of Western Arabic numerals in Arabic locale
  if (locale === 'ar') {
    locale += '-u-nu-latn'
  }

  switch (units) {
    case SETTINGS_UNITS_IMPERIAL: {
      string = formatNumber(value, locale, {
        style: 'decimal',
        maximumFractionDigits: IMPERIAL_PRECISION
      })
      break
    }
    case SETTINGS_UNITS_METRIC:
    default: {
      string = formatNumber(value, locale, {
        style: 'decimal',
        maximumFractionDigits: METRIC_PRECISION
      })
      break
    }
  }

  return string
}

/**
 * Given a measurement value (stored internally in Streetmix as metric units),
 * return an imperial quantity up to three decimal point precision.
 */
export function convertMetricMeasurementToImperial (value: number): number {
  return round(value * IMPERIAL_CONVERSION_RATE, IMPERIAL_PRECISION)
}

/**
 * Given a measurement, assumed to be in imperial units,
 * return a metric value up to three decimal point precision.
 */
export function convertImperialMeasurementToMetric (value: number): number {
  return round(value / IMPERIAL_CONVERSION_RATE, METRIC_PRECISION)
}

/**
 * Given a measurement, assumed to be in imperial units,
 * return a value rounded to the nearest (up or down) eighth.
 */
function roundToNearestEighth (value: number): number {
  return Math.round(value * 8) / 8
}

/**
 * Given a measurement value (assuming imperial units), return
 * a string formatted to use vulgar fractions, e.g. .5 => ½
 */
export function getImperialMeasurementWithVulgarFractions (
  value: number,
  locale: string
): string {
  // Determine if there is a vulgar fraction to display
  const remainder = value - Math.floor(value)
  const fraction = IMPERIAL_VULGAR_FRACTIONS[remainder.toString().substr(1)]

  if (fraction) {
    // Non-zero trailing number
    if (Math.floor(value)) {
      return (
        stringifyMeasurementValue(
          Math.floor(value),
          SETTINGS_UNITS_IMPERIAL,
          locale
        ) + fraction
      )
    } else {
      return fraction
    }
  }

  // Otherwise, just return the stringified value without fractions
  return stringifyMeasurementValue(value, SETTINGS_UNITS_IMPERIAL, locale)
}

/**
 * Given a width in any unit (including no unit), parses for units and returns
 * value multiplied by the appropriate multiplier.
 */
function parseStringForUnits (widthInput: string, units: UnitsSetting): number {
  if (widthInput.includes('-')) {
    widthInput = widthInput.replace(/-/g, '') // Dashes would mean negative in the parseFloat
  }

  let width = Number.parseFloat(widthInput)

  if (width) {
    let multiplier = 1
    let precision = METRIC_PRECISION

    if (units === SETTINGS_UNITS_IMPERIAL) {
      multiplier = 1 / IMPERIAL_CONVERSION_RATE
      precision = IMPERIAL_PRECISION
    }

    for (const converter of WIDTH_INPUT_CONVERSION) {
      if (widthInput.match(new RegExp('[\\d\\.]' + converter.text + '$'))) {
        multiplier = converter.multiplier
        break
      }
    }
    width *= multiplier
    return round(width, precision)
  } else {
    return 0 // Allows for leading zeros, like 0'7"
  }
}
