import { round } from '@streetmix/utils'

import { SETTINGS_UNITS_IMPERIAL } from '../users/constants'

import type { UnitsSetting } from '@streetmix/types'

const IMPERIAL_CONVERSION_RATE = 0.3048
const METRIC_PRECISION = 3
const IMPERIAL_PRECISION = 3

const WIDTH_INPUT_CONVERSION = [
  { text: 'm', multiplier: 1 },
  { text: 'м', multiplier: 1 },
  { text: 'dm', multiplier: 1 / 10 },
  { text: 'cm', multiplier: 1 / 100 },
  { text: 'mm', multiplier: 1 / 1000 },
  { text: '"', multiplier: (1 * IMPERIAL_CONVERSION_RATE) / 12 },
  { text: '″', multiplier: (1 * IMPERIAL_CONVERSION_RATE) / 12 },
  { text: 'in', multiplier: (1 * IMPERIAL_CONVERSION_RATE) / 12 },
  { text: 'in.', multiplier: (1 * IMPERIAL_CONVERSION_RATE) / 12 },
  { text: 'inch', multiplier: (1 * IMPERIAL_CONVERSION_RATE) / 12 },
  { text: 'inches', multiplier: (1 * IMPERIAL_CONVERSION_RATE) / 12 },
  { text: "'", multiplier: 1 * IMPERIAL_CONVERSION_RATE },
  { text: '′', multiplier: 1 * IMPERIAL_CONVERSION_RATE },
  { text: 'ft', multiplier: 1 * IMPERIAL_CONVERSION_RATE },
  { text: 'ft.', multiplier: 1 * IMPERIAL_CONVERSION_RATE },
  { text: 'feet', multiplier: 1 * IMPERIAL_CONVERSION_RATE },
]

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

/**
 * Processes a string width input from user, returns a number
 */
export function processWidthInput(
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
 * Given a width in any unit (including no unit), parses for units and returns
 * value multiplied by the appropriate multiplier.
 */
function parseStringForUnits(widthInput: string, units: UnitsSetting): number {
  if (widthInput.includes('-')) {
    widthInput = widthInput.replace(/-/g, '') // Dashes would mean negative in the parseFloat
  }

  let width = Number.parseFloat(widthInput)

  if (width) {
    let multiplier = 1
    let precision = METRIC_PRECISION

    if (units === SETTINGS_UNITS_IMPERIAL) {
      multiplier = 1 * IMPERIAL_CONVERSION_RATE
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
