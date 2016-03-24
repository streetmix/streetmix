/* global street, SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC */
const IMPERIAL_METRIC_MULTIPLIER = 30 / 100
const METRIC_PRECISION = 3

const WIDTH_INPUT_CONVERSION = [
  { text: 'm', multiplier: 1 / IMPERIAL_METRIC_MULTIPLIER },
  { text: 'cm', multiplier: 1 / 100 / IMPERIAL_METRIC_MULTIPLIER },
  { text: '"', multiplier: 1 / 12 },
  { text: 'inch', multiplier: 1 / 12 },
  { text: 'inches', multiplier: 1 / 12 },
  { text: "'", multiplier: 1 },
  { text: 'ft', multiplier: 1 },
  { text: 'feet', multiplier: 1 }
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

export function processWidthInput (widthInput) {
  widthInput = widthInput.replace(/ /g, '')
  widthInput = widthInput.replace(/,/g, '.')

  for (var i in IMPERIAL_VULGAR_FRACTIONS) {
    if (widthInput.indexOf(IMPERIAL_VULGAR_FRACTIONS[i]) != -1) {
      widthInput = widthInput.replace(new RegExp(IMPERIAL_VULGAR_FRACTIONS[i]), i)
    }
  }

  var width = parseFloat(widthInput)

  if (width) {
    // Default unit
    switch (street.units) {
      case SETTINGS_UNITS_METRIC:
        var multiplier = 1 / IMPERIAL_METRIC_MULTIPLIER
        break
      case SETTINGS_UNITS_IMPERIAL:
        var multiplier = 1
        break
    }

    for (var i in WIDTH_INPUT_CONVERSION) {
      if (widthInput.match(new RegExp('[\\d\\.]' +
          WIDTH_INPUT_CONVERSION[i].text + '$'))) {
        var multiplier = WIDTH_INPUT_CONVERSION[i].multiplier
        break
      }
    }

    width *= multiplier
  }

  return width
}

/**
 * Formats a width to a "pretty" output and converts the value to the user's
 * current units settings (imperial or metric).
 *
 * @param {Number} width to display
 * @param {(boolean)} [options.markup = false]
 *    If true, <wbr> (word break opportunity) tags are inserted into return value.
 * @param {(boolean)} [options.input = false]
 *    If true, the value is intended to be used in an input box and should be
 *    formatted without fractions or units
 */
export function prettifyWidth (width, { markup = false, input = false } = {}) {
  let widthText = ''

  switch (street.units) {
    case SETTINGS_UNITS_IMPERIAL:
      widthText = width

      if (input !== true) {
        // Format with vulgar fractions, e.g. .5 => ½
        const remainder = width - Math.floor(width)

        if (IMPERIAL_VULGAR_FRACTIONS[('' + remainder).substr(1)]) {
          widthText =
          (Math.floor(width) ? Math.floor(width) : '') +
            IMPERIAL_VULGAR_FRACTIONS[('' + remainder).substr(1)]
        }

        // Add word break opportunity <wbr> tags and foot mark
        if (markup === true) {
          widthText += "<wbr>'"
        } else {
          widthText += "'"
        }
      }

      break
    case SETTINGS_UNITS_METRIC:
      widthText = (width * IMPERIAL_METRIC_MULTIPLIER).toFixed(METRIC_PRECISION).toString()

      if (widthText.substr(0, 2) == '0.') {
        widthText = widthText.substr(1)
      }
      while (widthText.substr(widthText.length - 1) == '0') {
        widthText = widthText.substr(0, widthText.length - 1)
      }
      if (widthText.substr(widthText.length - 1) == '.') {
        widthText = widthText.substr(0, widthText.length - 1)
      }
      if (!widthText) {
        widthText = '0'
      }

      // Add word break opportunity <wbr> tags and units, assuming
      // that the output is not used in an input tag
      if (input !== true) {
        if (markup === true) {
          widthText += '<wbr> m'
        } else {
          widthText += ' m'
        }
      }

      break
  }

  return widthText
}
