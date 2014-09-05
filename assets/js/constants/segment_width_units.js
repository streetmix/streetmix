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