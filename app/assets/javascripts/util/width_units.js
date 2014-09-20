var IMPERIAL_METRIC_MULTIPLIER = 30 / 100;
var COUNTRIES_IMPERIAL_UNITS = ['US'];

var WIDTH_INPUT_CONVERSION = [
  { text: 'm', multiplier: 1 / IMPERIAL_METRIC_MULTIPLIER },
  { text: 'cm', multiplier: 1 / 100 / IMPERIAL_METRIC_MULTIPLIER },
  { text: '"', multiplier: 1 / 12 },
  { text: 'inch', multiplier: 1 / 12 },
  { text: 'inches', multiplier: 1 / 12 },
  { text: '\'', multiplier: 1 },
  { text: 'ft', multiplier: 1 },
  { text: 'feet', multiplier: 1 }
];

var SEGMENT_WIDTH_RESOLUTION_IMPERIAL = .25;
var SEGMENT_WIDTH_CLICK_INCREMENT_IMPERIAL = .5;
var SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL = .5;

// don't use const because of rounding problems
var SEGMENT_WIDTH_RESOLUTION_METRIC = 1 / 3; // .1 / IMPERIAL_METRIC_MULTIPLER
var SEGMENT_WIDTH_CLICK_INCREMENT_METRIC = 2 / 3; // .2 / IMPERIAL_METRIC_MULTIPLER
var SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC = 2 / 3; // .2 / IMPERIAL_METRIC_MULTIPLER

var MIN_WIDTH_EDIT_CANVAS_WIDTH = 120;
var WIDTH_EDIT_MARGIN = 20;

var NORMALIZE_PRECISION = 5;
var METRIC_PRECISION = 3;
var WIDTH_ROUNDING = .01;

var SEGMENT_WARNING_OUTSIDE = 1;
var SEGMENT_WARNING_WIDTH_TOO_SMALL = 2;
var SEGMENT_WARNING_WIDTH_TOO_LARGE = 3;

var PRETTIFY_WIDTH_OUTPUT_MARKUP = 1;
var PRETTIFY_WIDTH_OUTPUT_NO_MARKUP = 2;
var PRETTIFY_WIDTH_INPUT = 3;

var SETTINGS_UNITS_IMPERIAL = 1;
var SETTINGS_UNITS_METRIC = 2;

var IMPERIAL_VULGAR_FRACTIONS = {
  '.125': '⅛',
  '.25': '¼',
  '.375': '⅜',
  '.5': '½',
  '.625': '⅝',
  '.75': '¾',
  '.875': '⅞'
};

function _processWidthInput(widthInput) {
  widthInput = widthInput.replace(/ /g, '');
  widthInput = widthInput.replace(/,/g, '.');

  for (var i in IMPERIAL_VULGAR_FRACTIONS) {
    if (widthInput.indexOf(IMPERIAL_VULGAR_FRACTIONS[i]) != -1) {
      widthInput = widthInput.replace(new RegExp(IMPERIAL_VULGAR_FRACTIONS[i]), i);
    }
  }

  var width = parseFloat(widthInput);

  if (width) {
    // Default unit
    switch (street.units) {
      case SETTINGS_UNITS_METRIC:
        var multiplier = 1 / IMPERIAL_METRIC_MULTIPLIER;
        break;
      case SETTINGS_UNITS_IMPERIAL:
        var multiplier = 1;
        break;
    }

    for (var i in WIDTH_INPUT_CONVERSION) {
      if (widthInput.match(new RegExp("[\\d\\.]" +
            WIDTH_INPUT_CONVERSION[i].text + "$"))) {
        var multiplier = WIDTH_INPUT_CONVERSION[i].multiplier;
        break;
      }
    }

    width *= multiplier;
  }

  return width;
}

function _prettifyWidth(width, purpose) {
  var remainder = width - Math.floor(width);

  switch (street.units) {
    case SETTINGS_UNITS_IMPERIAL:
      var widthText = width;

      if (purpose != PRETTIFY_WIDTH_INPUT) {
        if (IMPERIAL_VULGAR_FRACTIONS[('' + remainder).substr(1)]) {
          var widthText =
              (Math.floor(width) ? Math.floor(width) : '') +
              IMPERIAL_VULGAR_FRACTIONS[('' + remainder).substr(1)];
        }
      }

      switch (purpose) {
        case PRETTIFY_WIDTH_OUTPUT_NO_MARKUP:
          widthText += '\'';
          break;
        case PRETTIFY_WIDTH_OUTPUT_MARKUP:
          widthText += '<wbr>\'';
          break;
      }
      break;
    case SETTINGS_UNITS_METRIC:
      var widthText = '' +
          (width * IMPERIAL_METRIC_MULTIPLIER).toFixed(METRIC_PRECISION);

      if (widthText.substr(0, 2) == '0.') {
        widthText = widthText.substr(1);
      }
      while (widthText.substr(widthText.length - 1) == '0') {
        widthText = widthText.substr(0, widthText.length - 1);
      }
      if (widthText.substr(widthText.length - 1) == '.') {
        widthText = widthText.substr(0, widthText.length - 1);
      }
      if (!widthText) {
        widthText = '0';
      }

      switch (purpose) {
        case PRETTIFY_WIDTH_OUTPUT_NO_MARKUP:
          widthText += ' m';
          break;
        case PRETTIFY_WIDTH_OUTPUT_MARKUP:
          widthText += '<wbr> m';
          break;
      }
      break;
  }

  return widthText;
}
