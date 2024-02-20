import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '../users/constants'
import store from '../store'
import { formatNumber } from './number_format'

const IMPERIAL_CONVERSION_RATE = 0.3048
const METRIC_PRECISION = 3
const IMPERIAL_PRECISION = 3

const WIDTH_INPUT_CONVERSION = [
  { text: 'm', multiplier: 1 },
  { text: 'м', multiplier: 1 },
  { text: 'dm', multiplier: 1 / 10 },
  { text: 'cm', multiplier: 1 / 100 },
  { text: 'mm', multiplier: 1 / 1000 },
  { text: '"', multiplier: (1 / IMPERIAL_CONVERSION_RATE) * 12 },
  { text: '″', multiplier: (1 / IMPERIAL_CONVERSION_RATE) * 12 },
  { text: 'in', multiplier: (1 / IMPERIAL_CONVERSION_RATE) * 12 },
  { text: 'in.', multiplier: (1 / IMPERIAL_CONVERSION_RATE) * 12 },
  { text: 'inch', multiplier: (1 / IMPERIAL_CONVERSION_RATE) * 12 },
  { text: 'inches', multiplier: (1 / IMPERIAL_CONVERSION_RATE) * 12 },
  { text: "'", multiplier: 1 / IMPERIAL_CONVERSION_RATE },
  { text: '′', multiplier: 1 / IMPERIAL_CONVERSION_RATE },
  { text: 'ft', multiplier: 1 / IMPERIAL_CONVERSION_RATE },
  { text: 'ft.', multiplier: 1 / IMPERIAL_CONVERSION_RATE },
  { text: 'feet', multiplier: 1 / IMPERIAL_CONVERSION_RATE }
]

const IMPERIAL_VULGAR_FRACTIONS = {
  '.125': '⅛',
  '.25': '¼',
  '.375': '⅜',
  '.5': '½',
  '.625': '⅝',
  '.75': '¾',
  '.875': '⅞'
}

// https://www.jacklmoore.com/notes/rounding-in-javascript/
function round (value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
}

/**
 * Processes width input from user
 *
 * @param {string} widthInput
 * @param {Number} units - either SETTINGS_UNITS_METRIC or SETTINGS_UNITS_IMPERIAL
 * @returns {Number} width - in default units, regardless of provided units
 */
export function processWidthInput (widthInput, units) {
  if (!widthInput || units === undefined) return

  // Normalize certain input quirks. Spaces (more common at end or beginning of input)
  // go away, and comma-based decimals turn into period-based decimals
  widthInput = widthInput.replace(/ /g, '')
  widthInput = widthInput.replace(/,/g, '.')

  for (const i in IMPERIAL_VULGAR_FRACTIONS) {
    if (widthInput.indexOf(IMPERIAL_VULGAR_FRACTIONS[i]) !== -1) {
      widthInput = widthInput.replace(
        new RegExp(IMPERIAL_VULGAR_FRACTIONS[i]),
        i
      )
    }
  }

  let width

  // The conditional makes sure we only split and parse separately when the input includes ' as any character except the last
  if (
    widthInput.indexOf("'") !== -1 &&
    widthInput.length > widthInput.indexOf("'") + 1
  ) {
    widthInput = widthInput.split("'")
    widthInput[0] += "'" // Add the ' to the first value so the parser knows to convert in feet, not in unitless, when in metric
    width = widthInput.reduce(function (prev, cur) {
      if (cur.indexOf('"') === -1) {
        // Assuming anything coming after feet is going to be inches
        cur += '"'
      }

      return (
        parseStringForUnits(prev.toString()) +
        parseStringForUnits(cur.toString(), units)
      )
    })
  } else {
    width = parseStringForUnits(widthInput, units)
  }

  return width
}

/**
 * Formats a width to a "pretty" output and converts the value to the user's
 * current units settings (imperial or metric).
 *
 * @param {Number} width to display
 * @param {Number} units - units, either SETTINGS_UNITS_METRIC or
 *            SETTINGS_UNITS_IMPERIAL, to format width as. If undefined,
 *            assume metric.
 * @param {string} locale - string
 * @returns {string}
 */
export function prettifyWidth (width, units, locale) {
  let widthText = ''

  // LEGACY: Not all uses of this function pass in locale
  if (!locale) {
    locale = store.getState().locale.locale
  }

  switch (units) {
    case SETTINGS_UNITS_IMPERIAL:
      widthText = getImperialMeasurementWithVulgarFractions(width, locale) // also converts to string
      widthText += '′'
      break
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
        // In Arabic, use the same character that the USDM uses for metric units
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
 * Returns a measurement value as a locale-sensitive string without units or formatting,
 * and converts to the desired units, if necessary.
 * Used primarily when converting input box values to a simple number format
 *
 * @param {Number} value - original measurement value
 * @param {Number} units - either SETTINGS_UNITS_METRIC or SETTINGS_UNITS_IMPERIAL
 *          Defaults to metric.
 * @param {string} locale - locale code
 * @returns {string} string - for display
 */
export function stringifyMeasurementValue (value, units, locale) {
  let string = ''

  if (!value) return '0'

  // Force the use of Western Arabic numerals in Arabic locale
  if (locale === 'ar') {
    locale += '-u-nu-latn'
  }

  switch (units) {
    case SETTINGS_UNITS_IMPERIAL: {
      const convertedValue = convertMetricMeasurementToImperial(value)
      string = formatNumber(convertedValue, locale, {
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
 *
 * @param {Number} value, assuming metric units
 * @returns {Number} value in imperial units
 */
function convertMetricMeasurementToImperial (value) {
  return round(value * IMPERIAL_CONVERSION_RATE, IMPERIAL_PRECISION)
}

/**
 * Given a measurement value, assumed to be in imperial units,
 * return a metric quantity up to three decimal point precision.
 *
 * @param {Number} value, assuming imperial units
 * @returns {Number} value in metric units
 */
// Not used here, but keeping for now in case we change how unit
// conversion works.
// eslint-disable-next-line no-unused-vars
function convertImperialMeasurementToMetric (value) {
  return round(value / IMPERIAL_CONVERSION_RATE, METRIC_PRECISION)
}

/**
 * Given a measurement value (assuming imperial units), return
 * a string formatted to use vulgar fractions, e.g. .5 => ½
 *
 * @param {Number} value, assuming imperial units
 * @param {string} locale - locale code
 * @returns {string} stringified value formatted with vulgar fractions
 */
export function getImperialMeasurementWithVulgarFractions (value, locale) {
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
 *
 * @param {String} widthInput to convert to number
 * @param {Number} units - either SETTINGS_UNITS_METRIC or SETTINGS_UNITS_IMPERIAL
 * @returns {Number} formatted width as number
 */
function parseStringForUnits (widthInput, units) {
  if (widthInput.indexOf('-') !== -1) {
    widthInput = widthInput.replace(/-/g, '') // Dashes would mean negative in the parseFloat
  }

  let width = Number.parseFloat(widthInput)

  if (width) {
    let multiplier = 1

    if (units === SETTINGS_UNITS_IMPERIAL) {
      multiplier = 1 / IMPERIAL_CONVERSION_RATE
    }

    for (const i in WIDTH_INPUT_CONVERSION) {
      if (
        widthInput.match(
          new RegExp('[\\d\\.]' + WIDTH_INPUT_CONVERSION[i].text + '$')
        )
      ) {
        multiplier = WIDTH_INPUT_CONVERSION[i].multiplier
        break
      }
    }
    width *= multiplier
    return width
  } else {
    return 0 // Allows for leading zeros, like 0'7"
  }
}
