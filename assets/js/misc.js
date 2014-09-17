/*
 * This file is beginning as 10,494 lines of client-side Javascript.
 * Eventually it will be split and modularized into smaller pieces:
 * https://github.com/codeforamerica/streetmix/issues/226
 */

"use strict";

var TWITTER_ID = '@streetmix';

var NEW_STREET_DEFAULT = 1;
var NEW_STREET_EMPTY = 2;

var VARIANT_ICON_START_X = 164; // x24 in tileset file
var VARIANT_ICON_START_Y = 64; // x24 in tileset file
var VARIANT_ICON_SIZE = 24;

var WIDTH_PALETTE_MULTIPLIER = 4;

var CANVAS_HEIGHT = 480;
var CANVAS_GROUND = 35;
var CANVAS_BASELINE = CANVAS_HEIGHT - CANVAS_GROUND;

var SEGMENT_Y_NORMAL = 265;
var SEGMENT_Y_PALETTE = 20;
var PALETTE_EXTRA_SEGMENT_PADDING = 8;

var DRAG_OFFSET_Y_PALETTE = -340 - 150;
var DRAG_OFFSET_Y_TOUCH_PALETTE = -100;
var DRAG_OFFSET_Y_TOUCH = -100;

var THUMBNAIL_WIDTH = 180;
var THUMBNAIL_HEIGHT = 110;
var THUMBNAIL_MULTIPLIER = .1 * 2;
var BACKGROUND_DIRT_COLOUR = 'rgb(53, 45, 39)';

var WIDTH_CHART_WIDTH = 500;
var WIDTH_CHART_EMPTY_OWNER_WIDTH = 40;
var WIDTH_CHART_MARGIN = 20;

var DRAGGING_TYPE_NONE = 0;
var DRAGGING_TYPE_CLICK_OR_MOVE = 1;
var DRAGGING_TYPE_MOVE = 2;
var DRAGGING_TYPE_RESIZE = 3;

var DRAGGING_TYPE_MOVE_TRANSFER = 1;
var DRAGGING_TYPE_MOVE_CREATE = 2;

var DRAGGING_MOVE_HOLE_WIDTH = 40;

var STATUS_MESSAGE_HIDE_DELAY = 15000;
var WIDTH_EDIT_INPUT_DELAY = 200;
var SHORT_DELAY = 100;

var TOUCH_CONTROLS_FADEOUT_TIME = 3000;
var TOUCH_CONTROLS_FADEOUT_DELAY = 3000;

var SEGMENT_SWITCHING_TIME = 250;

var SAVE_STREET_DELAY = 500;

var BLOCKING_SHIELD_DARKEN_DELAY = 800;
var BLOCKING_SHIELD_TOO_SLOW_DELAY = 10000;

var MAX_DRAG_DEGREE = 20;

var STREET_WIDTH_CUSTOM = -1;
var STREET_WIDTH_SWITCH_TO_METRIC = -2;
var STREET_WIDTH_SWITCH_TO_IMPERIAL = -3;

var DEFAULT_STREET_WIDTH = 80;
var DEFAULT_STREET_WIDTHS = [40, 60, 80];

var MIN_CUSTOM_STREET_WIDTH = 10;
var MAX_CUSTOM_STREET_WIDTH = 400;
var MIN_SEGMENT_WIDTH = 1;
var MAX_SEGMENT_WIDTH = 400;

var MAX_CANVAS_HEIGHT = 2048;

var RESIZE_TYPE_INITIAL = 0;
var RESIZE_TYPE_INCREMENT = 1;
var RESIZE_TYPE_DRAGGING = 2;
var RESIZE_TYPE_PRECISE_DRAGGING = 3;
var RESIZE_TYPE_TYPING = 4;

var CSS_TRANSFORMS = ['webkitTransform', 'MozTransform', 'transform'];

var INFO_BUBBLE_MARGIN_BUBBLE = 20;
var INFO_BUBBLE_MARGIN_MOUSE = 10;

var INFO_BUBBLE_TYPE_SEGMENT = 1;
var INFO_BUBBLE_TYPE_LEFT_BUILDING = 2;
var INFO_BUBBLE_TYPE_RIGHT_BUILDING = 3;

var MAX_RAND_SEED = 999999999;

var TRACK_CATEGORY_INTERACTION = 'Interaction';
var TRACK_CATEGORY_EVENT = 'Event';
var TRACK_CATEGORY_ERROR = 'Error';

var TRACK_ACTION_LEARN_MORE = 'Learn more about segment';
var TRACK_ACTION_STREET_MODIFIED_ELSEWHERE = 'Street modified elsewhere';
var TRACK_ACTION_CHANGE_WIDTH = 'Change width';
var TRACK_ACTION_REMOVE_SEGMENT = 'Remove segment';
var TRACK_ACTION_ERROR_15A = 'Error 15A (sign in API failure)';
var TRACK_ACTION_ERROR_RM1 = 'Error RM1 (auth 401 failure on load)';
var TRACK_ACTION_ERROR_RM2 = 'Error RM2 (auth 401 failure mid-flight)';
var TRACK_ACTION_ERROR_GEOLOCATION_TIMEOUT = 'Geolocation timeout';

var TRACK_LABEL_INCREMENT_BUTTON = 'Increment button';
var TRACK_LABEL_INPUT_FIELD = 'Input field';
var TRACK_LABEL_DRAGGING = 'Dragging';
var TRACK_LABEL_KEYBOARD = 'Keyboard';
var TRACK_LABEL_BUTTON = 'Button';

var DATE_FORMAT = 'MMM D, YYYY';

var WELCOME_NONE = 0;
var WELCOME_NEW_STREET = 1;
var WELCOME_FIRST_TIME_NEW_STREET = 2;
var WELCOME_FIRST_TIME_EXISTING_STREET = 3;

var LIVE_UPDATE_DELAY = 5000;

var SKY_COLOUR = 'rgb(169, 204, 219)';
var SKY_WIDTH = 250;
var BOTTOM_BACKGROUND = 'rgb(216, 211, 203)';

// TODO clean up/rearrange variables

// Saved data
// ------------------------------------------------------------------------

var lastStreet;

var ignoreWindowFocus = false;

var suppressMouseEnter = false;

// ------------------------------------------------------------------------

var errorUrl = '';
var currentErrorType;

var readOnly = false;

var draggingType = DRAGGING_TYPE_NONE;

var draggingResize = {
  segmentEl: null,
  floatingEl: null,
  mouseX: null,
  mouseY: null,
  elX: null,
  elY: null,
  width: null,
  originalX: null,
  originalWidth: null,
  right: false
};

var draggingMove = {
  type: null,
  active: false,
  withinCanvas: null,
  segmentBeforeEl: null,
  segmentAfterEl: null,
  mouseX: null,
  mouseY: null,
  el: null,
  elX: null,
  elY: null,
  originalEl: null,
  originalWidth: null,
  originalType: null,
  originalVariantString: null,
  originalRandSeed: null,
  floatingElVisible: false
};

var initializing = false;

var widthHeightEditHeld = false;
var widthHeightChangeTimerId = -1;

var streetSectionCanvasLeft;

var mouseX;
var mouseY;

var system = {
  touch: false,
  phone: false,
  safari: false,
  windows: false,

  viewportWidth: null,
  viewportHeight: null,

  hiDpi: 1.0,
  cssTransform: false,

  ipAddress: null,

  apiUrl: null
};

var streetSectionTop;

var segmentWidthResolution;
var segmentWidthClickIncrement;
var segmentWidthDraggingResolution;

var menuVisible = false;

var widthChartShowTimerId = -1;
var widthChartHideTimerId = -1;

var latestRequestId;
var latestVerificationStreet;

// -------------------------------------------------------------------------

function _drawSegmentImage(tileset, ctx, sx, sy, sw, sh, dx, dy, dw, dh) {
  if (!sw || !sh || !dw || !dh) {
    return;
  }

  if ((imagesToBeLoaded == 0) && (sw > 0) && (sh > 0) && (dw > 0) && (dh > 0)) {
    sx += TILESET_CORRECTION[tileset] * 12;

    dx *= system.hiDpi;
    dy *= system.hiDpi;
    dw *= system.hiDpi;
    dh *= system.hiDpi;

    if (sx < 0) {
      dw += sx;
      sx = 0;
    }

    if (debug.canvasRectangles) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(dx, dy, dw, dh);
    }

    ctx.drawImage(images['/images/tiles-' + tileset + '.png'],
        sx * TILESET_POINT_PER_PIXEL, sy * TILESET_POINT_PER_PIXEL,
        sw * TILESET_POINT_PER_PIXEL, sh * TILESET_POINT_PER_PIXEL,
        dx, dy, dw, dh);
  }
}

function _getVariantInfoDimensions(variantInfo, initialSegmentWidth, multiplier) {
  var segmentWidth = initialSegmentWidth / TILE_SIZE / multiplier;

  var center = segmentWidth / 2;
  var left = center;
  var right = center;

  if (variantInfo.graphics.center) {
    var graphic = variantInfo.graphics.center;
    for (var l = 0; l < graphic.length; l++) {
      var newLeft = center - graphic[l].width / 2 + (graphic[l].offsetX || 0);
      var newRight = center + graphic[l].width / 2 + (graphic[l].offsetX || 0);

      if (newLeft < left) {
        left = newLeft;
      }
      if (newRight > right) {
        right = newRight;
      }
    }
  }

  if (variantInfo.graphics.left) {
    var graphic = variantInfo.graphics.left;
    for (var l = 0; l < graphic.length; l++) {
      var newLeft = graphic[l].offsetX || 0;
      var newRight = graphic[l].width + (graphic[l].offsetX || 0);

      if (newLeft < left) {
        left = newLeft;
      }
      if (newRight > right) {
        right = newRight;
      }
    }
  }

  if (variantInfo.graphics.right) {
    var graphic = variantInfo.graphics.right;
    for (var l = 0; l < graphic.length; l++) {
      var newLeft = (segmentWidth) - (graphic[l].offsetX || 0) - graphic[l].width;
      var newRight = (segmentWidth) - (graphic[l].offsetX || 0);

      if (newLeft < left) {
        left = newLeft;
      }
      if (newRight > right) {
        right = newRight;
      }
    }
  }

  if (variantInfo.graphics.repeat && variantInfo.graphics.repeat[0]) {
    var newLeft = center - (segmentWidth / 2);
    var newRight = center + (segmentWidth / 2);

    if (newLeft < left) {
      left = newLeft;
    }
    if (newRight > right) {
      right = newRight;
    }
  }

  return { left: left, right: right, center: center };
}

function _drawSegmentContents(ctx, type, variantString, segmentWidth, offsetLeft, offsetTop, randSeed, multiplier, palette) {
  var segmentInfo = SEGMENT_INFO[type];
  var variantInfo = SEGMENT_INFO[type].details[variantString];

  var dimensions = _getVariantInfoDimensions(variantInfo, segmentWidth, multiplier);
  var left = dimensions.left;
  var right = dimensions.right;
  var center = dimensions.center;

  if (variantInfo.graphics.repeat) {
    for (var l = 0; l < variantInfo.graphics.repeat.length; l++) {
      var repeatPositionX = variantInfo.graphics.repeat[l].x * TILE_SIZE;
      var repeatPositionY = (variantInfo.graphics.repeat[l].y || 0) * TILE_SIZE;
      var w = variantInfo.graphics.repeat[l].width * TILE_SIZE * multiplier;

      var count = Math.floor((segmentWidth) / w + 1);

      if (left < 0) {
        var repeatStartX = -left * TILE_SIZE;
      } else {
        var repeatStartX = 0;
      }

      for (var i = 0; i < count; i++) {
        // remainder
        if (i == count - 1) {
          w = segmentWidth - (count - 1) * w;
        }

        _drawSegmentImage(variantInfo.graphics.repeat[l].tileset, ctx,
          repeatPositionX, repeatPositionY,
          w, variantInfo.graphics.repeat[l].height * TILE_SIZE,
          offsetLeft + (repeatStartX + (i * variantInfo.graphics.repeat[l].width) * TILE_SIZE) * multiplier,
          offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.repeat[l].offsetY || 0)),
          w,
          variantInfo.graphics.repeat[l].height * TILE_SIZE * multiplier);
      }
    }
  }

  if (variantInfo.graphics.left) {
    for (var l = 0; l < variantInfo.graphics.left.length; l++) {
      var leftPositionX = variantInfo.graphics.left[l].x * TILE_SIZE;
      var leftPositionY = (variantInfo.graphics.left[l].y || 0) * TILE_SIZE;

      var w = variantInfo.graphics.left[l].width * TILE_SIZE;

      var x = 0 + (-left + (variantInfo.graphics.left[l].offsetX || 0)) * TILE_SIZE * multiplier;

      _drawSegmentImage(variantInfo.graphics.left[l].tileset, ctx,
          leftPositionX, leftPositionY,
          w, variantInfo.graphics.left[l].height * TILE_SIZE,
          offsetLeft + x,
          offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.left[l].offsetY || 0)),
          w * multiplier, variantInfo.graphics.left[l].height * TILE_SIZE * multiplier);
    }
  }

  if (variantInfo.graphics.right) {
    for (var l = 0; l < variantInfo.graphics.right.length; l++) {
      var rightPositionX = variantInfo.graphics.right[l].x * TILE_SIZE;
      var rightPositionY = (variantInfo.graphics.right[l].y || 0) * TILE_SIZE;

      var w = variantInfo.graphics.right[l].width * TILE_SIZE;

      var x = (-left + segmentWidth / TILE_SIZE / multiplier - variantInfo.graphics.right[l].width - (variantInfo.graphics.right[l].offsetX || 0)) * TILE_SIZE * multiplier;

      _drawSegmentImage(variantInfo.graphics.right[l].tileset, ctx,
        rightPositionX, rightPositionY,
        w, variantInfo.graphics.right[l].height * TILE_SIZE,
        offsetLeft + x,
        offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.right[l].offsetY || 0)),
        w * multiplier, variantInfo.graphics.right[l].height * TILE_SIZE * multiplier);
    }
  }

  if (variantInfo.graphics.center) {
    for (var l = 0; l < variantInfo.graphics.center.length; l++) {
      var bkPositionX = (variantInfo.graphics.center[l].x || 0) * TILE_SIZE;
      var bkPositionY = (variantInfo.graphics.center[l].y || 0) * TILE_SIZE;

      var width = variantInfo.graphics.center[l].width;

      var x = (center - variantInfo.graphics.center[l].width / 2 - left - (variantInfo.graphics.center[l].offsetX || 0)) * TILE_SIZE * multiplier;

      _drawSegmentImage(variantInfo.graphics.center[l].tileset, ctx,
        bkPositionX, bkPositionY,
        width * TILE_SIZE, variantInfo.graphics.center[l].height * TILE_SIZE,
        offsetLeft + x,
        offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.center[l].offsetY || 0)),
        width * TILE_SIZE * multiplier, variantInfo.graphics.center[l].height * TILE_SIZE * multiplier);
    }
  }

  if (type == 'sidewalk') {
    _drawProgrammaticPeople(ctx, segmentWidth / multiplier, offsetLeft - left * TILE_SIZE * multiplier, offsetTop, randSeed, multiplier, variantString);
  }
}

function _setSegmentContents(el, type, variantString, segmentWidth, randSeed, palette, quickUpdate) {
  var segmentInfo = SEGMENT_INFO[type];
  var variantInfo = SEGMENT_INFO[type].details[variantString];

  var multiplier = palette ? (WIDTH_PALETTE_MULTIPLIER / TILE_SIZE) : 1;
  var dimensions = _getVariantInfoDimensions(variantInfo, segmentWidth, multiplier);

  var totalWidth = dimensions.right - dimensions.left;

  var offsetTop = palette ? SEGMENT_Y_PALETTE : SEGMENT_Y_NORMAL;

  if (!quickUpdate) {
    var hoverBkEl = document.createElement('div');
    hoverBkEl.classList.add('hover-bk');
  }

  if (!quickUpdate) {
    var canvasEl = document.createElement('canvas');
    canvasEl.classList.add('image');
  } else {
    var canvasEl = el.querySelector('canvas');
  }
  canvasEl.width = totalWidth * TILE_SIZE * system.hiDpi;
  canvasEl.height = CANVAS_BASELINE * system.hiDpi;
  canvasEl.style.width = (totalWidth * TILE_SIZE) + 'px';
  canvasEl.style.height = CANVAS_BASELINE + 'px';
  canvasEl.style.left = (dimensions.left * TILE_SIZE * multiplier) + 'px';

  var ctx = canvasEl.getContext('2d');

  _drawSegmentContents(ctx, type, variantString, segmentWidth, 0, offsetTop, randSeed, multiplier, palette);

  if (!quickUpdate) {
    _removeElFromDom(el.querySelector('canvas'));
    el.appendChild(canvasEl);

    _removeElFromDom(el.querySelector('.hover-bk'));
    el.appendChild(hoverBkEl);
  }
}


function _onWidthHeightEditClick(event) {
  var el = event.target;

  el.hold = true;
  widthHeightEditHeld = true;

  if (document.activeElement != el) {
    el.select();
  }
}

function _onWidthHeightEditMouseOver(event) {
  if (!widthHeightEditHeld) {
    event.target.focus();
    event.target.select();
  }
}

function _onWidthHeightEditMouseOut(event) {
  var el = event.target;
  if (!widthHeightEditHeld) {
    _loseAnyFocus();
  }
}

function _loseAnyFocus() {
  document.body.focus();
}

function _isFocusOnBody() {
  return document.activeElement == document.body;
}

function _onWidthEditFocus(event) {
  var el = event.target;

  el.oldValue = el.realValue;
  el.value = _prettifyWidth(el.realValue, PRETTIFY_WIDTH_INPUT);
}

function _onHeightEditFocus(event) {
  var el = event.target;

  el.oldValue = el.realValue;
  el.value = _prettifyHeight(el.realValue, PRETTIFY_WIDTH_INPUT);
}

function _onWidthEditBlur(event) {
  var el = event.target;

  _widthEditInputChanged(el, true);

  el.realValue = parseFloat(el.segmentEl.getAttribute('width'));
  el.value = _prettifyWidth(el.realValue, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);

  el.hold = false;
  widthHeightEditHeld = false;
}

function _onHeightEditBlur(event) {
  var el = event.target;

  _heightEditInputChanged(el, true);

  el.realValue = (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ? street.leftBuildingHeight : street.rightBuildingHeight;
  el.value = _prettifyHeight(el.realValue, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);

  el.hold = false;
  widthHeightEditHeld = false;
}

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

function _heightEditInputChanged(el, immediate) {
  window.clearTimeout(widthHeightChangeTimerId);

  var height = parseInt(el.value);

  if (!height || (height < 1)) {
    height = 1;
  } else if (height > MAX_BUILDING_HEIGHT) {
    height = MAX_BUILDING_HEIGHT;
  }

  if (immediate) {
    if (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) {
      street.leftBuildingHeight = height;
    } else {
      street.rightBuildingHeight = height;
    }
    _buildingHeightUpdated();
  } else {
    widthHeightChangeTimerId = window.setTimeout(function() {
      if (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) {
        street.leftBuildingHeight = height;
      } else {
        street.rightBuildingHeight = height;
      }
      _buildingHeightUpdated();
    }, WIDTH_EDIT_INPUT_DELAY);
  }
}

function _widthEditInputChanged(el, immediate) {
  window.clearTimeout(widthHeightChangeTimerId);

  var width = _processWidthInput(el.value);

  if (width) {
    var segmentEl = el.segmentEl;

    if (immediate) {
      _resizeSegment(segmentEl, RESIZE_TYPE_TYPING,
          width * TILE_SIZE, false, false);
      _infoBubble.updateWidthButtonsInContents(width);
    } else {
      widthHeightChangeTimerId = window.setTimeout(function() {
        _resizeSegment(segmentEl, RESIZE_TYPE_TYPING,
        width * TILE_SIZE, false, false);
      _infoBubble.updateWidthButtonsInContents(width);
      }, WIDTH_EDIT_INPUT_DELAY);
    }
  }
}

function _onWidthEditInput(event) {
  _widthEditInputChanged(event.target, false);

  _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH,
      TRACK_LABEL_INPUT_FIELD, null, true);
}

function _onHeightEditInput(event) {
  _heightEditInputChanged(event.target, false);
}

function _onWidthEditKeyDown(event) {
  var el = event.target;

  switch (event.keyCode) {
    case KEYS.ENTER:
      _widthEditInputChanged(el, true);
      _loseAnyFocus();
      el.value = _prettifyWidth(el.segmentEl.getAttribute('width'), PRETTIFY_WIDTH_INPUT);
      el.focus();
      el.select();
      break;
    case KEYS.ESC:
      el.value = el.oldValue;
      _widthEditInputChanged(el, true);
      _hideMenus();
      _loseAnyFocus();
      break;
  }
}

function _onHeightEditKeyDown(event) {
  var el = event.target;

  switch (event.keyCode) {
    case KEYS.ENTER:
      _heightEditInputChanged(el, true);
      _loseAnyFocus();
      el.value = _prettifyHeight((_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ? street.leftBuildingHeight : street.rightBuildingHeight, PRETTIFY_WIDTH_INPUT);
      el.focus();
      el.select();
      break;
    case KEYS.ESC:
      el.value = el.oldValue;
      _heightEditInputChanged(el, true);
      _hideMenus();
      _loseAnyFocus();
      break;
  }
}

function _normalizeStreetWidth(width) {
  if (width < MIN_CUSTOM_STREET_WIDTH) {
    width = MIN_CUSTOM_STREET_WIDTH;
  } else if (width > MAX_CUSTOM_STREET_WIDTH) {
    width = MAX_CUSTOM_STREET_WIDTH;
  }

  var resolution = segmentWidthResolution;
  width = Math.round(width / resolution) * resolution;

  return width;
}

function _normalizeSegmentWidth(width, resizeType) {
  if (width < MIN_SEGMENT_WIDTH) {
    width = MIN_SEGMENT_WIDTH;
  } else if (width > MAX_SEGMENT_WIDTH) {
    width = MAX_SEGMENT_WIDTH;
  }

  switch (resizeType) {
    case RESIZE_TYPE_INITIAL:
    case RESIZE_TYPE_TYPING:
    case RESIZE_TYPE_INCREMENT:
    case RESIZE_TYPE_PRECISE_DRAGGING:
      var resolution = segmentWidthResolution;
      break;
    case RESIZE_TYPE_DRAGGING:
      var resolution = segmentWidthDraggingResolution;
      break;
  }

  width = Math.round(width / resolution) * resolution;
  width = parseFloat(width.toFixed(NORMALIZE_PRECISION));

  return width;
}

function _prettifyHeight(height, purpose) {
  var heightText = height;

  switch (purpose) {
    case PRETTIFY_WIDTH_INPUT:
      break;
    case PRETTIFY_WIDTH_OUTPUT_MARKUP:
    case PRETTIFY_WIDTH_OUTPUT_NO_MARKUP:
      heightText += ' floor';
      if (height > 1) {
        heightText += 's';
      }

      var attr = _getBuildingAttributes(street, _infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING);

      heightText += ' (' + _prettifyWidth(attr.realHeight / TILE_SIZE, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP) + ')';

      break;
  }
  return heightText;
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

function _incrementSegmentWidth(segmentEl, add, precise) {
  var width = parseFloat(segmentEl.getAttribute('width'));

  if (precise) {
    var increment = segmentWidthResolution;
  } else {
    var increment = segmentWidthClickIncrement;
  }

  if (!add) {
    increment = -increment;
  }
  width = _normalizeSegmentWidth(width + increment, RESIZE_TYPE_INCREMENT);

  _resizeSegment(segmentEl, RESIZE_TYPE_INCREMENT,
      width * TILE_SIZE, true, false);
}

function _onWidthDecrementClick(event) {
  var el = event.target;
  var segmentEl = el.segmentEl;
  var precise = event.shiftKey;

  _incrementSegmentWidth(segmentEl, false, precise);
  _scheduleControlsFadeout(segmentEl);

  _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH,
      TRACK_LABEL_INCREMENT_BUTTON, null, true);
}

function _onWidthIncrementClick(event) {
  var el = event.target;
  var segmentEl = el.segmentEl;
  var precise = event.shiftKey;

  _incrementSegmentWidth(segmentEl, true, precise);
  _scheduleControlsFadeout(segmentEl);

  _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH,
      TRACK_LABEL_INCREMENT_BUTTON, null, true);
}

function _resizeSegment(el, resizeType, width, updateEdit, palette, initial) {
  if (!palette) {
    var width =
        _normalizeSegmentWidth(width / TILE_SIZE, resizeType) * TILE_SIZE;
  }

  document.body.classList.add('immediate-segment-resize');

  window.setTimeout(function() {
    document.body.classList.remove('immediate-segment-resize');
  }, SHORT_DELAY);

  var oldWidth = parseFloat(el.getAttribute('width') * TILE_SIZE);

  el.style.width = width + 'px';
  el.setAttribute('width', width / TILE_SIZE);

  var widthEl = el.querySelector('span.width');
  if (widthEl) {
    widthEl.innerHTML =
        _prettifyWidth(width / TILE_SIZE, PRETTIFY_WIDTH_OUTPUT_MARKUP);
  }

  _setSegmentContents(el, el.getAttribute('type'),
    el.getAttribute('variant-string'), width, parseInt(el.getAttribute('rand-seed')), palette, false);

  if (updateEdit) {
    _infoBubble.updateWidthInContents(el, width / TILE_SIZE);
  }

  if (!initial) {
    _segmentsChanged();

    if (oldWidth != width) {
      _showWidthChartImmediately();
    }
  }
}

function _getVariantString(variant) {
  var string = '';
  for (var i in variant) {
    string += variant[i] + VARIANT_SEPARATOR;
  }

  string = string.substr(0, string.length - 1);
  return string;
}

function _createSegment(type, variantString, width, isUnmovable, palette, randSeed) {
  var el = document.createElement('div');
  el.classList.add('segment');
  el.setAttribute('type', type);
  el.setAttribute('variant-string', variantString);
  if (randSeed) {
    el.setAttribute('rand-seed', randSeed);
  }

  if (isUnmovable) {
    el.classList.add('unmovable');
  }

  if (!palette) {
    el.style.zIndex = SEGMENT_INFO[type].zIndex;

    var variantInfo = SEGMENT_INFO[type].details[variantString];
    var name = variantInfo.name || SEGMENT_INFO[type].name;

    var innerEl = document.createElement('span');
    innerEl.classList.add('name');
    innerEl.innerHTML = name;
    el.appendChild(innerEl);

    var innerEl = document.createElement('span');
    innerEl.classList.add('width');
    el.appendChild(innerEl);

    var dragHandleEl = document.createElement('span');
    dragHandleEl.classList.add('drag-handle');
    dragHandleEl.classList.add('left');
    dragHandleEl.segmentEl = el;
    dragHandleEl.innerHTML = '‹';
    dragHandleEl.addEventListener('mouseover', _showWidthChart);
    dragHandleEl.addEventListener('mouseout', _hideWidthChart);
    el.appendChild(dragHandleEl);

    var dragHandleEl = document.createElement('span');
    dragHandleEl.classList.add('drag-handle');
    dragHandleEl.classList.add('right');
    dragHandleEl.segmentEl = el;
    dragHandleEl.innerHTML = '›';
    dragHandleEl.addEventListener('mouseover', _showWidthChart);
    dragHandleEl.addEventListener('mouseout', _hideWidthChart);
    el.appendChild(dragHandleEl);

    var innerEl = document.createElement('span');
    innerEl.classList.add('grid');
    el.appendChild(innerEl);
  } else {
    el.setAttribute('title', SEGMENT_INFO[type].name);
  }

  if (width) {
    _resizeSegment(el, RESIZE_TYPE_INITIAL, width, true, palette, true);
  }

  if (!palette && !system.touch) {
    $(el).mouseenter(_onSegmentMouseEnter);
    $(el).mouseleave(_onSegmentMouseLeave);
  }
  return el;
}

function _createSegmentDom(segment) {
  return _createSegment(segment.type, segment.variantString,
      segment.width * TILE_SIZE, segment.unmovable, false, segment.randSeed);
}

function _onSegmentMouseEnter(event) {
  if (suppressMouseEnter) {
    return;
  }

  _infoBubble.considerShowing(event, this, INFO_BUBBLE_TYPE_SEGMENT);
}

function _onSegmentMouseLeave() {
  _infoBubble.dontConsiderShowing();
}

function _createDomFromData() {
  document.querySelector('#street-section-editable').innerHTML = '';

  for (var i in street.segments) {
    var segment = street.segments[i];

    var el = _createSegmentDom(segment);
    document.querySelector('#street-section-editable').appendChild(el);

    segment.el = el;
    segment.el.dataNo = i;
  }

  _repositionSegments();
  _updateBuildingPosition();
  _createBuildings();
}

function _repositionSegments() {
  var left = 0;
  var noMoveLeft = 0;

  var extraWidth = 0;

  for (var i in street.segments) {
    var el = street.segments[i].el;

    if (el == draggingMove.segmentBeforeEl) {
      left += DRAGGING_MOVE_HOLE_WIDTH;
      extraWidth += DRAGGING_MOVE_HOLE_WIDTH;

      if (!draggingMove.segmentAfterEl) {
        left += DRAGGING_MOVE_HOLE_WIDTH;
        extraWidth += DRAGGING_MOVE_HOLE_WIDTH;
      }
    }

    if (el.classList.contains('dragged-out')) {
      var width = 0;
    } else {
      var width = parseFloat(el.getAttribute('width')) * TILE_SIZE;
    }

    el.savedLeft = parseInt(left); // so we don’t have to use offsetLeft
    el.savedNoMoveLeft = parseInt(noMoveLeft); // so we don’t have to use offsetLeft
    el.savedWidth = parseInt(width);

    left += width;
    noMoveLeft += width;

    if (el == draggingMove.segmentAfterEl) {
      left += DRAGGING_MOVE_HOLE_WIDTH;
      extraWidth += DRAGGING_MOVE_HOLE_WIDTH;

      if (!draggingMove.segmentBeforeEl) {
        left += DRAGGING_MOVE_HOLE_WIDTH;
        extraWidth += DRAGGING_MOVE_HOLE_WIDTH;
      }
    }
  }

  var occupiedWidth = left;
  var noMoveOccupiedWidth = noMoveLeft;

  var mainLeft = Math.round((street.width * TILE_SIZE - occupiedWidth) / 2);
  var mainNoMoveLeft = Math.round((street.width * TILE_SIZE - noMoveOccupiedWidth) / 2);

  for (var i in street.segments) {
    var el = street.segments[i].el;

    el.savedLeft += mainLeft;
    el.savedNoMoveLeft += mainNoMoveLeft;

    if (system.cssTransform) {
      el.style[system.cssTransform] = 'translateX(' + el.savedLeft + 'px)';
      el.cssTransformLeft = el.savedLeft;
    } else {
      el.style.left = el.savedLeft + 'px';
    }
  }

  if (system.cssTransform) {
    document.querySelector('#street-section-left-empty-space').
        style[system.cssTransform] = 'translateX(' + (-extraWidth / 2) + 'px)';
    document.querySelector('#street-section-right-empty-space').
        style[system.cssTransform] = 'translateX(' + (extraWidth / 2) + 'px)';
  } else {
    document.querySelector('#street-section-left-empty-space').
        style.marginLeft = -(extraWidth / 2) + 'px';
    document.querySelector('#street-section-right-empty-space').
        style.marginLeft = (extraWidth / 2) + 'px';
  }
}

function _applyWarningsToSegments() {
  for (var i in street.segments) {
    var segment = street.segments[i];

    if (segment.el) {
      if (segment.warnings[SEGMENT_WARNING_OUTSIDE] ||
          segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] ||
          segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]) {
        segment.el.classList.add('warning');
      } else {
        segment.el.classList.remove('warning');
      }

      if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
        segment.el.classList.add('outside');
      } else {
        segment.el.classList.remove('outside');
      }
    }
    _infoBubble.updateWarningsInContents(segment);
  }
}

function _recalculateOccupiedWidth() {
  street.occupiedWidth = 0;

  for (var i in street.segments) {
    var segment = street.segments[i];

    street.occupiedWidth += segment.width;
  }

  street.remainingWidth = street.width - street.occupiedWidth;
  // Rounding problems :·(
  if (Math.abs(street.remainingWidth) < WIDTH_ROUNDING) {
    street.remainingWidth = 0;
  }

  _buildStreetWidthMenu();
  _updateStreetMetadata();
}

function _recalculateWidth() {
  _recalculateOccupiedWidth();

  var position = street.width / 2 - street.occupiedWidth / 2;

  for (var i in street.segments) {
    var segment = street.segments[i];
    var segmentInfo = SEGMENT_INFO[segment.type];
    var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString];

    if (segment.el) {
      if ((street.remainingWidth < 0) &&
          ((position < 0) || ((position + segment.width) > street.width))) {
        segment.warnings[SEGMENT_WARNING_OUTSIDE] = true;
      } else {
        segment.warnings[SEGMENT_WARNING_OUTSIDE] = false;
      }

      if (variantInfo.minWidth && (segment.width < variantInfo.minWidth)) {
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = true;
      } else {
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = false;
      }

      if (variantInfo.maxWidth && (segment.width > variantInfo.maxWidth)) {
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = true;
      } else {
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = false;
      }
    }

    position += street.segments[i].width;
  }

  var lastOverflow = document.body.classList.contains('street-overflows');

  if (street.remainingWidth >= 0) {
    document.body.classList.remove('street-overflows');
  } else {
    document.body.classList.add('street-overflows');
  }

  if (lastOverflow != document.body.classList.contains('street-overflows')) {
    _createBuildings();
  }

  _repositionEmptySegments();

  _applyWarningsToSegments();
}

function _hideEmptySegment(position) {
  document.querySelector('#street-section-' + position + '-empty-space').
      classList.remove('visible');
}

function _showEmptySegment(position, width) {
  document.querySelector('#street-section-' + position + '-empty-space .width').innerHTML =
      _prettifyWidth(width / TILE_SIZE, PRETTIFY_WIDTH_OUTPUT_MARKUP);
  document.querySelector('#street-section-' + position + '-empty-space').
      classList.add('visible');

  if (position == 'right') {
    width--; // So that the rules align
  }
  document.querySelector('#street-section-' + position + '-empty-space').
      style.width = width + 'px';
}

function _repositionEmptySegments() {
  if (street.remainingWidth <= 0) {
    _hideEmptySegment('left');
    _hideEmptySegment('right');
  } else {
    if (!street.occupiedWidth) {
      var width = street.remainingWidth * TILE_SIZE;
      _showEmptySegment('left', width);
      _hideEmptySegment('right');
    } else {
      var width = street.remainingWidth / 2 * TILE_SIZE;
      _showEmptySegment('left', width);
      _showEmptySegment('right', width);
    }
  }
}

function _segmentsChanged() {
  if (!initializing) {
    _createDataFromDom();
  }

  _recalculateWidth();
  _recalculateOwnerWidths();

  for (var i in street.segments) {
    if (street.segments[i].el) {
      street.segments[i].el.dataNo = i;
    }
  }

  _saveStreetToServerIfNecessary();
  _updateUndoButtons();
  _repositionSegments();

  printingNeedsUpdating = true;
}

function _updateEverything(dontScroll) {
  ignoreStreetChanges = true;
  _propagateUnits();
  _buildStreetWidthMenu();
  _updateShareMenu();
  _createDomFromData();
  _segmentsChanged();
  _resizeStreetWidth(dontScroll);
  _updateStreetName();
  ignoreStreetChanges = false;
  _updateUndoButtons();
  lastStreet = _trimStreetData(street);

  _scheduleSavingStreetToServer();
}

function _generateRandSeed() {
  var randSeed = 1 + Math.floor(Math.random() * MAX_RAND_SEED); // So it’s not zero
  return randSeed;
}

function _setStreetCreatorId(newId) {
  street.creatorId = newId;

  _unifyUndoStack();
  _updateLastStreetInfo();
}

function _setUpdateTimeToNow() {
  street.updatedAt = new Date().getTime();
  _unifyUndoStack();
  _updateStreetMetadata();
}

function _saveStreetToServerIfNecessary() {
  if (ignoreStreetChanges || abortEverything) {
    return;
  }

  var currentData = _trimStreetData(street);

  if (JSON.stringify(currentData) != JSON.stringify(lastStreet)) {
    if (street.editCount !== null) {
      street.editCount++;
      //console.log('increment editCount', street.editCount);
    } else {
      //console.log('not incrementing editCount since null');
    }
    _setUpdateTimeToNow();
    _hideWelcome();

    // As per issue #306.
    _statusMessage.hide();

    _updateStreetMetadata();

    _createNewUndoIfNecessary(lastStreet, currentData);

    _scheduleSavingStreetToServer();

    printingNeedsUpdating = true;
    lastStreet = currentData;

    _updateUndoButtons();
  }
}

function _checkIfChangesSaved() {
  // don’t do for settings deliberately

  if (abortEverything) {
    return;
  }

  var showWarning = false;

  if (saveStreetIncomplete) {
    showWarning = true;
  } else for (var i in nonblockingAjaxRequests) {
    if (!nonblockingAjaxRequests[i].allowToClosePage) {
      showWarning = true;
    }
  }

  if (showWarning) {
    nonblockingAjaxRequestTimer = 0;
    _scheduleNextNonblockingAjaxRequest();

    return 'Your changes have not been saved yet. Please return to the page, check your Internet connection, and wait a little while to allow the changes to be saved.';
  }
}

function _onWindowBeforeUnload() {
  var text = _checkIfChangesSaved();
  if (text) {
    return text;
  }
}

function _getVariantArray(segmentType, variantString) {
  var variantArray = {};
  var variantSplit = variantString.split(VARIANT_SEPARATOR);

  for (var i in SEGMENT_INFO[segmentType].variants) {
    var variantName = SEGMENT_INFO[segmentType].variants[i];

    variantArray[variantName] = variantSplit[i];
  }

  return variantArray;
}

// Copies only the data necessary for save/undo.
function _trimStreetData(street) {
  var newData = {};

  newData.schemaVersion = street.schemaVersion;

  newData.width = street.width;
  newData.name = street.name;

  newData.id = street.id;
  newData.namespacedId = street.namespacedId;
  newData.creatorId = street.creatorId;
  newData.originalStreetId = street.originalStreetId;
  newData.units = street.units;

  if (street.editCount !== null) {
    //console.log('saving editCount', street.editCount);
    newData.editCount = street.editCount;
  } else {
    //console.log('not saving editCount');
  }

  newData.leftBuildingHeight = street.leftBuildingHeight;
  newData.rightBuildingHeight = street.rightBuildingHeight;
  newData.leftBuildingVariant = street.leftBuildingVariant;
  newData.rightBuildingVariant = street.rightBuildingVariant;

  newData.segments = [];

  for (var i in street.segments) {
    var segment = {};
    segment.type = street.segments[i].type;
    segment.variantString = street.segments[i].variantString;
    segment.width = street.segments[i].width;
    if (street.segments[i].randSeed) {
      segment.randSeed = street.segments[i].randSeed;
    }

    newData.segments.push(segment);
  }

  return newData;
}

// TODO this function should not exist; all the data should be in street.
// object to begin with
function _createDataFromDom() {
  var els = document.querySelectorAll('#street-section-editable > .segment');

  street.segments = [];

  for (var i = 0, el; el = els[i]; i++) {
    var segment = {};
    segment.type = el.getAttribute('type');
    if (el.getAttribute('rand-seed')) {
      segment.randSeed = parseInt(el.getAttribute('rand-seed'));
    }
    segment.variantString = el.getAttribute('variant-string');
    segment.variant = _getVariantArray(segment.type, segment.variantString);
    segment.width = parseFloat(el.getAttribute('width'));
    segment.el = el;
    segment.warnings = [];
    street.segments.push(segment);
  }
}

function _drawLine(ctx, x1, y1, x2, y2) {
  x1 *= system.hiDpi;
  y1 *= system.hiDpi;
  x2 *= system.hiDpi;
  y2 *= system.hiDpi;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function _drawArrowLine(ctx, x1, y1, x2, y2, text) {
  x1 += 2;
  x2 -= 2;

  _drawLine(ctx, x1, y1, x2, y2);

  if (text) {
    ctx.font = (12 * system.hiDpi) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, (x1 + x2) / 2 * system.hiDpi, y1 * system.hiDpi - 10);
  }
}

function _updateWidthChart(ownerWidths) {
  return;

  var ctx = document.querySelector('#width-chart').getContext('2d');

  var chartWidth = WIDTH_CHART_WIDTH;
  var canvasWidth = document.querySelector('#width-chart').offsetWidth;
  var canvasHeight = document.querySelector('#width-chart').offsetHeight;

  document.querySelector('#width-chart').width = canvasWidth * system.hiDpi;
  document.querySelector('#width-chart').height = canvasHeight * system.hiDpi;

  chartWidth -= WIDTH_CHART_MARGIN * 2;

  var left = (canvasWidth - chartWidth) / 2;

  for (var id in SEGMENT_OWNERS) {
    if (ownerWidths[id] == 0) {
      chartWidth -= WIDTH_CHART_EMPTY_OWNER_WIDTH;
    }
  }

  var maxWidth = street.width;
  if (street.occupiedWidth > street.width) {
    maxWidth = street.occupiedWidth;
  }

  var multiplier = chartWidth / maxWidth;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;

  var bottom = 70;

  _drawLine(ctx, left, 20, left, bottom);
  if (maxWidth > street.width) {
    _drawLine(ctx, left + street.width * multiplier, 20,
        left + street.width * multiplier, 40);

    ctx.save();
    // TODO const
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';
    _drawArrowLine(ctx,
      left + street.width * multiplier, 30,
      left + maxWidth * multiplier, 30,
      _prettifyWidth(-street.remainingWidth, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP));
    ctx.restore();
  }

  _drawLine(ctx, left + maxWidth * multiplier, 20,
      left + maxWidth * multiplier, bottom);
  _drawArrowLine(ctx,
      left, 30, left + street.width * multiplier, 30,
      _prettifyWidth(street.width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP));

  var x = left;

  for (var id in SEGMENT_OWNERS) {
    if (ownerWidths[id] > 0) {
      var width = ownerWidths[id] * multiplier;

      _drawArrowLine(ctx, x, 60, x + width, 60,
          _prettifyWidth(ownerWidths[id], PRETTIFY_WIDTH_OUTPUT_NO_MARKUP));
      _drawLine(ctx, x + width, 50, x + width, 70);

      var imageWidth = images[SEGMENT_OWNERS[id].imageUrl].width / 5 * SEGMENT_OWNERS[id].imageSize;
      var imageHeight = images[SEGMENT_OWNERS[id].imageUrl].height / 5 * SEGMENT_OWNERS[id].imageSize;

      ctx.drawImage(images[SEGMENT_OWNERS[id].imageUrl],
          0,
          0,
          images[SEGMENT_OWNERS[id].imageUrl].width,
          images[SEGMENT_OWNERS[id].imageUrl].height,
          (x + width / 2 - imageWidth / 2) * system.hiDpi,
          (80 - imageHeight) * system.hiDpi,
          imageWidth * system.hiDpi,
          imageHeight * system.hiDpi);

      x += width;
    }
  }

  if (street.remainingWidth > 0) {
    ctx.save();
    // TODO const
    ctx.strokeStyle = 'rgb(100, 100, 100)';
    ctx.fillStyle = 'rgb(100, 100, 100)';
    if (ctx.setLineDash) {
      ctx.setLineDash([15, 10]);
    }
    _drawArrowLine(ctx, x, 60, left + street.width * multiplier, 60, _prettifyWidth(street.remainingWidth, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP));
    ctx.restore();
  }

  x = left + maxWidth * multiplier;

  for (var id in SEGMENT_OWNERS) {
    if (ownerWidths[id] == 0) {
      var width = WIDTH_CHART_EMPTY_OWNER_WIDTH;

      ctx.fillStyle = 'rgb(100, 100, 100)';
      ctx.strokeStyle = 'rgb(100, 100, 100)';

      _drawArrowLine(ctx, x, 60, x + width, 60, '–');
      _drawLine(ctx, x + width, 50, x + width, 70);

      var imageWidth = images[SEGMENT_OWNERS[id].imageUrl].width / 5 * SEGMENT_OWNERS[id].imageSize;
      var imageHeight = images[SEGMENT_OWNERS[id].imageUrl].height / 5 * SEGMENT_OWNERS[id].imageSize;

      ctx.save();
      ctx.globalAlpha = .5;
      ctx.drawImage(images[SEGMENT_OWNERS[id].imageUrl],
          0,
          0,
          images[SEGMENT_OWNERS[id].imageUrl].width,
          images[SEGMENT_OWNERS[id].imageUrl].height,
          (x + width / 2 - imageWidth / 2) * system.hiDpi,
          (80 - imageHeight) * system.hiDpi,
          imageWidth * system.hiDpi,
          imageHeight * system.hiDpi);
      ctx.restore();

      x += width;
    }
  }
}

function _showWidthChartImmediately() {
  return;

  document.querySelector('.width-chart-canvas').classList.add('visible');
}

function _showWidthChart() {
  window.clearTimeout(widthChartHideTimerId);
  window.clearTimeout(widthChartShowTimerId);

  // TODO const
  widthChartShowTimerId = window.setTimeout(_showWidthChartImmediately, 750);
}

function _hideWidthChartImmediately() {
  document.querySelector('.width-chart-canvas').classList.remove('visible');
}

function _hideWidthChart() {
  window.clearTimeout(widthChartHideTimerId);
  window.clearTimeout(widthChartShowTimerId);

  // TODO const
  widthChartHideTimerId = window.setTimeout(_hideWidthChartImmediately, 2000);
}

function _recalculateOwnerWidths() {
  var ownerWidths = {};

  for (var id in SEGMENT_OWNERS) {
    ownerWidths[id] = 0;
  }

  for (var i in street.segments) {
    var segment = street.segments[i];

    ownerWidths[SEGMENT_INFO[segment.type].owner] += segment.width;
  }

  _updateWidthChart(ownerWidths);
}

function _changeDraggingType(newDraggingType) {
  draggingType = newDraggingType;

  document.body.classList.remove('segment-move-dragging');
  document.body.classList.remove('segment-resize-dragging');

  switch (draggingType) {
    case DRAGGING_TYPE_RESIZE:
      document.body.classList.add('segment-resize-dragging');
      break;
    case DRAGGING_TYPE_MOVE:
      document.body.classList.add('segment-move-dragging');
      break;
  }
}

function _handleSegmentResizeStart(event) {
  if (readOnly) {
    return;
  }

  if (event.touches && event.touches[0]) {
    var x = event.touches[0].pageX;
    var y = event.touches[0].pageY;
  } else {
    var x = event.pageX;
    var y = event.pageY;
  }

  ignoreStreetChanges = true;

  var el = event.target;

  _changeDraggingType(DRAGGING_TYPE_RESIZE);

  var pos = _getElAbsolutePos(el);

  draggingResize.right = el.classList.contains('right');

  draggingResize.floatingEl = document.createElement('div');
  draggingResize.floatingEl.classList.add('drag-handle');
  draggingResize.floatingEl.classList.add('floating');

  if (el.classList.contains('left')) {
    draggingResize.floatingEl.classList.add('left');
  } else {
    draggingResize.floatingEl.classList.add('right');
  }

  draggingResize.floatingEl.style.left = (pos[0] - document.querySelector('#street-section-outer').scrollLeft) + 'px';
  draggingResize.floatingEl.style.top = pos[1] + 'px';
  document.body.appendChild(draggingResize.floatingEl);

  draggingResize.mouseX = x;
  draggingResize.mouseY = y;

  draggingResize.elX = pos[0];
  draggingResize.elY = pos[1];

  draggingResize.originalX = draggingResize.elX;
  draggingResize.originalWidth = parseFloat(el.segmentEl.getAttribute('width'));
  draggingResize.segmentEl = el.segmentEl;

  draggingResize.segmentEl.classList.add('hover');

  var segmentInfo = SEGMENT_INFO[el.segmentEl.getAttribute('type')];
  var variantInfo = SEGMENT_INFO[el.segmentEl.getAttribute('type')].details[el.segmentEl.getAttribute('variant-string')];

  if (variantInfo.minWidth) {
    var guideEl = document.createElement('div');
    guideEl.classList.add('guide');
    guideEl.classList.add('min');

    var width = variantInfo.minWidth * TILE_SIZE;
    guideEl.style.width = width + 'px';
    guideEl.style.marginLeft = (-width / 2) + 'px';
    el.segmentEl.appendChild(guideEl);
  }

  var remainingWidth =
      street.remainingWidth + parseFloat(el.segmentEl.getAttribute('width'));

  if (remainingWidth &&
      (((!variantInfo.minWidth) && (remainingWidth >= MIN_SEGMENT_WIDTH)) || (remainingWidth >= variantInfo.minWidth)) &&
      ((!variantInfo.maxWidth) || (remainingWidth <= variantInfo.maxWidth))) {
    var guideEl = document.createElement('div');
    guideEl.classList.add('guide');
    guideEl.classList.add('max');

    var width = remainingWidth * TILE_SIZE;
    guideEl.style.width = width + 'px';
    guideEl.style.marginLeft = (-width / 2) + 'px';
    el.segmentEl.appendChild(guideEl);
  } else if (variantInfo.maxWidth) {
    var guideEl = document.createElement('div');
    guideEl.classList.add('guide');
    guideEl.classList.add('max');

    var width = variantInfo.maxWidth * TILE_SIZE;
    guideEl.style.width = width + 'px';
    guideEl.style.marginLeft = (-width / 2) + 'px';
    el.segmentEl.appendChild(guideEl);
  }

  _infoBubble.hide();
  _infoBubble.hideSegment(true);
  _cancelFadeoutControls();
  _hideControls();

  window.setTimeout(function() {
    el.segmentEl.classList.add('hover');
  }, 0);

  _showWidthChartImmediately();
}

function _handleSegmentResizeMove(event) {
  if (event.touches && event.touches[0]) {
    var x = event.touches[0].pageX;
    var y = event.touches[0].pageY;
  } else {
    var x = event.pageX;
    var y = event.pageY;
  }

  var deltaX = x - draggingResize.mouseX;
  var deltaY = y - draggingResize.mouseY;

  var deltaFromOriginal = draggingResize.elX - draggingResize.originalX;
  if (!draggingResize.right) {
    deltaFromOriginal = -deltaFromOriginal;
  }

  draggingResize.elX += deltaX;
  draggingResize.floatingEl.style.left = (draggingResize.elX - document.querySelector('#street-section-outer').scrollLeft) + 'px';

  draggingResize.width = draggingResize.originalWidth + deltaFromOriginal / TILE_SIZE * 2;
  var precise = event.shiftKey;

  if (precise) {
    var resizeType = RESIZE_TYPE_PRECISE_DRAGGING;
  } else {
    var resizeType = RESIZE_TYPE_DRAGGING;
  }

  _resizeSegment(draggingResize.segmentEl, resizeType,
      draggingResize.width * TILE_SIZE, true, false);

  draggingResize.mouseX = x;
  draggingResize.mouseY = y;

  // TODO hack so it doesn’t disappear
  _showWidthChartImmediately();
}

function _handleSegmentClickOrMoveStart(event) {
  if (readOnly) {
    return;
  }

  ignoreStreetChanges = true;

  if (event.touches && event.touches[0]) {
    var x = event.touches[0].pageX;
    var y = event.touches[0].pageY;
  } else {
    var x = event.pageX;
    var y = event.pageY;
  }

  var el = event.target;
  draggingMove.originalEl = el;

  _changeDraggingType(DRAGGING_TYPE_CLICK_OR_MOVE);

  draggingMove.mouseX = x;
  draggingMove.mouseY = y;
}

function _handleSegmentMoveStart() {
  if (readOnly) {
    return;
  }

  _changeDraggingType(DRAGGING_TYPE_MOVE);

  draggingMove.originalType = draggingMove.originalEl.getAttribute('type');

  if (draggingMove.originalEl.classList.contains('palette')) {
    if (SEGMENT_INFO[draggingMove.originalType].needRandSeed) {
      draggingMove.originalRandSeed = _generateRandSeed();
    }
    draggingMove.type = DRAGGING_TYPE_MOVE_CREATE;
    draggingMove.originalWidth =
        SEGMENT_INFO[draggingMove.originalType].defaultWidth * TILE_SIZE;

    // TODO hack to get the first
    for (var j in SEGMENT_INFO[draggingMove.originalType].details) {
      draggingMove.originalVariantString = j;
      break;
    }
  } else {
    draggingMove.originalRandSeed =
        parseInt(draggingMove.originalEl.getAttribute('rand-seed'));
    draggingMove.type = DRAGGING_TYPE_MOVE_TRANSFER;
    draggingMove.originalWidth =
        draggingMove.originalEl.offsetWidth;
    draggingMove.originalVariantString =
        draggingMove.originalEl.getAttribute('variant-string');
  }

  var pos = _getElAbsolutePos(draggingMove.originalEl);

  draggingMove.elX = pos[0];
  draggingMove.elY = pos[1];

  if (draggingMove.type == DRAGGING_TYPE_MOVE_CREATE) {
    draggingMove.elY += DRAG_OFFSET_Y_PALETTE;
    draggingMove.elX -= draggingMove.originalWidth / 3;
  } else {
    draggingMove.elX -= document.querySelector('#street-section-outer').scrollLeft;
  }

  draggingMove.floatingEl = document.createElement('div');
  draggingMove.floatingEl.classList.add('segment');
  draggingMove.floatingEl.classList.add('floating');
  draggingMove.floatingEl.classList.add('first-drag-move');
  draggingMove.floatingEl.setAttribute('type', draggingMove.originalType);
  draggingMove.floatingEl.setAttribute('variant-string',
      draggingMove.originalVariantString);
  draggingMove.floatingElVisible = false;
  _setSegmentContents(draggingMove.floatingEl,
      draggingMove.originalType,
      draggingMove.originalVariantString,
      draggingMove.originalWidth,
      draggingMove.originalRandSeed,
      false, false);
  document.body.appendChild(draggingMove.floatingEl);

  if (system.cssTransform) {
    draggingMove.floatingEl.style[system.cssTransform] =
        'translate(' + draggingMove.elX + 'px, ' + draggingMove.elY + 'px)';
  } else {
    draggingMove.floatingEl.style.left = draggingMove.elX + 'px';
    draggingMove.floatingEl.style.top = draggingMove.elY + 'px';
  }

  if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
    draggingMove.originalEl.classList.add('dragged-out');
    draggingMove.originalEl.classList.remove('immediate-show-drag-handles');
    draggingMove.originalEl.classList.remove('show-drag-handles');
    draggingMove.originalEl.classList.remove('hover');
  }

  draggingMove.segmentBeforeEl = null;
  draggingMove.segmentAfterEl = null;
  _updateWithinCanvas(true);

  _infoBubble.hide();
  _cancelFadeoutControls();
  _hideControls();
}

function _updateWithinCanvas(_newWithinCanvas) {
  draggingMove.withinCanvas = _newWithinCanvas;

  if (draggingMove.withinCanvas) {
    document.body.classList.remove('not-within-canvas');
  } else {
    document.body.classList.add('not-within-canvas');
  }
}

function _handleSegmentClickOrMoveMove(event) {
  if (event.touches && event.touches[0]) {
    var x = event.touches[0].pageX;
    var y = event.touches[0].pageY;
  } else {
    var x = event.pageX;
    var y = event.pageY;
  }

  var deltaX = x - draggingMove.mouseX;
  var deltaY = y - draggingMove.mouseY;

  // TODO const
  if ((Math.abs(deltaX) > 5) || (Math.abs(deltaY) > 5)) {
    _handleSegmentMoveStart();
    _handleSegmentMoveMove(event);
  }
}

function _handleSegmentMoveMove(event) {
  if (event.touches && event.touches[0]) {
    var x = event.touches[0].pageX;
    var y = event.touches[0].pageY;
  } else {
    var x = event.pageX;
    var y = event.pageY;
  }

  var deltaX = x - draggingMove.mouseX;
  var deltaY = y - draggingMove.mouseY;

  draggingMove.elX += deltaX;
  draggingMove.elY += deltaY;

  if (!draggingMove.floatingElVisible) {
    draggingMove.floatingElVisible = true;

    if (system.touch) {
      if (draggingMove.type == DRAGGING_TYPE_MOVE_CREATE) {
        draggingMove.elY += DRAG_OFFSET_Y_TOUCH_PALETTE;
      } else {
        draggingMove.elY += DRAG_OFFSET_Y_TOUCH;
      }
    }

    window.setTimeout(function() {
      draggingMove.floatingEl.classList.remove('first-drag-move');
    }, SHORT_DELAY);
  }

  if (system.cssTransform) {
    draggingMove.floatingEl.style[system.cssTransform] =
        'translate(' + draggingMove.elX + 'px, ' + draggingMove.elY + 'px)';

    var deg = deltaX;

    if (deg > MAX_DRAG_DEGREE) {
      deg = MAX_DRAG_DEGREE;
    } else if (deg < -MAX_DRAG_DEGREE) {
      deg = -MAX_DRAG_DEGREE;
    }

    if (system.cssTransform) {
      draggingMove.floatingEl.querySelector('canvas').style[system.cssTransform] =
          'rotateZ(' + deg + 'deg)';
    }
  } else {
    draggingMove.floatingEl.style.left = draggingMove.elX + 'px';
    draggingMove.floatingEl.style.top = draggingMove.elY + 'px';
  }

  draggingMove.mouseX = x;
  draggingMove.mouseY = y;

  var newX = x - BUILDING_SPACE + document.querySelector('#street-section-outer').scrollLeft;

  if (_makeSpaceBetweenSegments(newX, y)) {
    var smartDrop = _doDropHeuristics(draggingMove.originalType,
        draggingMove.originalVariantString, draggingMove.originalWidth);

    if ((smartDrop.type != draggingMove.originalType) || (smartDrop.variantString != draggingMove.originalVariantString)) {
      _setSegmentContents(draggingMove.floatingEl,
        smartDrop.type,
        smartDrop.variantString,
        smartDrop.width,
        draggingMove.originalRandSeed, false, true);

      draggingMove.originalType = smartDrop.type;
      draggingMove.originalVariantString = smartDrop.variantString;
    }
  }

  if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
    document.querySelector('#trashcan').classList.add('visible');
  }
}

function _onBodyMouseOut(event) {
  _infoBubble.hide();
}

function _onBodyMouseDown(event) {
  var el = event.target;

  if (readOnly || (event.touches && event.touches.length != 1)) {
    return;
  }

  var topEl = event.target;

  // For street width editing on Firefox

  while (topEl && (topEl.id != 'street-width')) {
    topEl = topEl.parentNode;
  }

  var withinMenu = !!topEl;

  if (withinMenu) {
    return;
  }

  _loseAnyFocus();
  _hideDebugInfo();

  var topEl = event.target;

  while (topEl && (topEl.id != 'info-bubble') && (topEl.id != 'street-width') &&
    ((!topEl.classList) ||
    ((!topEl.classList.contains('menu-attached')) &&
    (!topEl.classList.contains('menu'))))) {
    topEl = topEl.parentNode;
  }

  var withinMenu = !!topEl;

  if (withinMenu) {
    return;
  }

  _hideMenus();

  if (el.classList.contains('drag-handle')) {
    _handleSegmentResizeStart(event);
  } else {
    if (!el.classList.contains('segment') ||
        el.classList.contains('unmovable')) {
      return;
    }

    _handleSegmentClickOrMoveStart(event);
  }

  event.preventDefault();
}

function _makeSpaceBetweenSegments(x, y) {
  var left = x - streetSectionCanvasLeft;

  var selectedSegmentBefore = null;
  var selectedSegmentAfter = null;

  if (street.segments.length) {
    var farLeft = street.segments[0].el.savedNoMoveLeft;
    var farRight =
        street.segments[street.segments.length - 1].el.savedNoMoveLeft +
        street.segments[street.segments.length - 1].el.savedWidth;
  } else {
    var farLeft = 0;
    var farRight = street.width * TILE_SIZE;
  }
  // TODO const
  var space = (street.width - street.occupiedWidth) * TILE_SIZE / 2;
  if (space < 100) {
    space = 100;
  }

  // TODO const
  if ((left < farLeft - space) || (left > farRight + space) ||
       (y < streetSectionTop - 100) || (y > streetSectionTop + 300)) {
    _updateWithinCanvas(false);
  } else {
    _updateWithinCanvas(true);
    for (var i in street.segments) {
      var segment = street.segments[i];

      if (!selectedSegmentBefore && ((segment.el.savedLeft + segment.el.savedWidth / 2) > left)) {
        selectedSegmentBefore = segment.el;
      }

      if ((segment.el.savedLeft + segment.el.savedWidth / 2) <= left) {
        selectedSegmentAfter = segment.el;
      }
    }
  }

  if ((selectedSegmentBefore != draggingMove.segmentBeforeEl) ||
      (selectedSegmentAfter != draggingMove.segmentAfterEl)) {
    draggingMove.segmentBeforeEl = selectedSegmentBefore;
    draggingMove.segmentAfterEl = selectedSegmentAfter;
    _repositionSegments();
    return true;
  } else {
    return false;
  }
}

function _onBodyMouseMove(event) {
  if (draggingType == DRAGGING_TYPE_NONE) {
    return;
  }

  switch (draggingType) {
    case DRAGGING_TYPE_CLICK_OR_MOVE:
      _handleSegmentClickOrMoveMove(event);
      break;
    case DRAGGING_TYPE_MOVE:
      _handleSegmentMoveMove(event);
      break;
    case DRAGGING_TYPE_RESIZE:
      _handleSegmentResizeMove(event);
      break;
  }

  event.preventDefault();
}

var controlsFadeoutDelayTimer = -1;
var controlsFadeoutHideTimer = -1;

function _scheduleControlsFadeout(el) {
  _infoBubble.considerShowing(null, el, INFO_BUBBLE_TYPE_SEGMENT);

  _resumeFadeoutControls();
}

function _resumeFadeoutControls() {
  if (!system.touch) {
    return;
  }

  _cancelFadeoutControls();

  controlsFadeoutDelayTimer = window.setTimeout(_fadeoutControls, TOUCH_CONTROLS_FADEOUT_DELAY);
}

function _cancelFadeoutControls() {
  document.body.classList.remove('controls-fade-out');
  window.clearTimeout(controlsFadeoutDelayTimer);
  window.clearTimeout(controlsFadeoutHideTimer);
}

function _fadeoutControls() {
  document.body.classList.add('controls-fade-out');

  controlsFadeoutHideTimer = window.setTimeout(_hideControls, TOUCH_CONTROLS_FADEOUT_TIME);
}

function _hideControls() {
  document.body.classList.remove('controls-fade-out');
  if (_infoBubble.segmentEl) {
    _infoBubble.segmentEl.classList.remove('show-drag-handles');

    window.setTimeout(function() {
      _infoBubble.hide();
      _infoBubble.hideSegment(true);
    }, 0);
  }
}

function _doDropHeuristics(type, variantString, width) {
  // Automatically figure out width

  if (draggingMove.type == DRAGGING_TYPE_MOVE_CREATE) {
    if ((street.remainingWidth > 0) &&
        (width > street.remainingWidth * TILE_SIZE)) {

      var segmentMinWidth =
          SEGMENT_INFO[type].details[variantString].minWidth || 0;

      if ((street.remainingWidth >= MIN_SEGMENT_WIDTH) &&
          (street.remainingWidth >= segmentMinWidth)) {
        width = _normalizeSegmentWidth(street.remainingWidth, RESIZE_TYPE_INITIAL) * TILE_SIZE;
      }
    }
  }

  // Automatically figure out variants

  var leftEl = draggingMove.segmentAfterEl;
  var rightEl = draggingMove.segmentBeforeEl;

  var left = leftEl ? street.segments[leftEl.dataNo] : null;
  var right = rightEl ? street.segments[rightEl.dataNo] : null;

  var leftVariants = left && SEGMENT_INFO[left.type].variants;
  var rightVariants = right && SEGMENT_INFO[right.type].variants;

  var leftOwner = left && SEGMENT_INFO[left.type].owner;
  var rightOwner = right && SEGMENT_INFO[right.type].owner;

  var leftOwnerAsphalt =
    (leftOwner == SEGMENT_OWNER_CAR) || (leftOwner == SEGMENT_OWNER_BIKE) ||
    (leftOwner == SEGMENT_OWNER_PUBLIC_TRANSIT);
  var rightOwnerAsphalt =
    (rightOwner == SEGMENT_OWNER_CAR) || (rightOwner == SEGMENT_OWNER_BIKE) ||
    (rightOwner == SEGMENT_OWNER_PUBLIC_TRANSIT);

  var leftVariant = left && _getVariantArray(left.type, left.variantString);
  var rightVariant = right && _getVariantArray(right.type, right.variantString);

  var variant = _getVariantArray(type, variantString);

  // Direction

  if (SEGMENT_INFO[type].variants.indexOf('direction') != -1) {
    if (leftVariant && leftVariant['direction']) {
      variant['direction'] = leftVariant['direction'];
    } else if (rightVariant && rightVariant['direction']) {
      variant['direction'] = rightVariant['direction'];
    }
  }

  // Parking lane orientation

  if (SEGMENT_INFO[type].variants.indexOf('parking-lane-orientation') != -1) {
    if (!right || !rightOwnerAsphalt) {
      variant['parking-lane-orientation'] = 'right';
    } else if (!left || !leftOwnerAsphalt) {
      variant['parking-lane-orientation'] = 'left';
    }
  }

  // Parklet orientation

  if (type == 'parklet') {
    if (left && leftOwnerAsphalt) {
      variant['orientation'] = 'right';
    } else if (right && rightOwnerAsphalt) {
      variant['orientation'] = 'left';
    }
  }

  // Turn lane orientation

  if (SEGMENT_INFO[type].variants.indexOf('turn-lane-orientation') != -1) {
    if (!right || !rightOwnerAsphalt) {
      variant['turn-lane-orientation'] = 'right';
    } else if (!left || !leftOwnerAsphalt) {
      variant['turn-lane-orientation'] = 'left';
    }
  }

  // Transit shelter orientation and elevation

  if (type == 'transit-shelter') {
    if (left && (leftOwner == SEGMENT_OWNER_PUBLIC_TRANSIT)) {
      variant['orientation'] = 'right';
    } else if (right && (rightOwner == SEGMENT_OWNER_PUBLIC_TRANSIT)) {
      variant['orientation'] = 'left';
    }
  }

  if (SEGMENT_INFO[type].variants.indexOf('transit-shelter-elevation') != -1) {
    if (variant['orientation'] == 'right' && left && left.type == 'light-rail') {
      variant['transit-shelter-elevation'] = 'light-rail';
    } else if (variant['orientation'] == 'left' && right && right.type == 'light-rail') {
      variant['transit-shelter-elevation'] = 'light-rail';
    }
  }

  // Bike rack orientation

  if (type == 'sidewalk-bike-rack') {
    if (left && (leftOwner != SEGMENT_OWNER_PEDESTRIAN)) {
      variant['orientation'] = 'left';
    } else if (right && (rightOwner != SEGMENT_OWNER_PEDESTRIAN)) {
      variant['orientation'] = 'right';
    }
  }

  // Lamp orientation

  if (SEGMENT_INFO[type].variants.indexOf('lamp-orientation') != -1) {
    if (left && right && leftOwnerAsphalt && rightOwnerAsphalt) {
      variant['lamp-orientation'] = 'both';
    } else if (left && leftOwnerAsphalt) {
      variant['lamp-orientation'] = 'left';
    } else if (right && rightOwnerAsphalt) {
      variant['lamp-orientation'] = 'right';
    } else if (left && right) {
      variant['lamp-orientation'] = 'both';
    } else if (left) {
      variant['lamp-orientation'] = 'left';
    } else if (right) {
      variant['lamp-orientation'] = 'right';
    } else {
      variant['lamp-orientation'] = 'both';
    }
  }

  variantString = _getVariantString(variant);

  return { type: type, variantString: variantString, width: width };
}

function _handleSegmentMoveCancel() {
  draggingMove.originalEl.classList.remove('dragged-out');

  draggingMove.segmentBeforeEl = null;
  draggingMove.segmentAfterEl = null;

  _repositionSegments();
  _updateWithinCanvas(true);

  _removeElFromDom(draggingMove.floatingEl);
  document.querySelector('#trashcan').classList.remove('visible');

  _changeDraggingType(DRAGGING_TYPE_NONE);
}

function _handleSegmentMoveEnd(event) {
  ignoreStreetChanges = false;

  var failedDrop = false;

  var segmentElControls = null;

  if (!draggingMove.withinCanvas) {
    if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
      _removeElFromDom(draggingMove.originalEl);
    }

    _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_REMOVE_SEGMENT,
        TRACK_LABEL_DRAGGING, null, true);
  } else if (draggingMove.segmentBeforeEl || draggingMove.segmentAfterEl || (street.segments.length == 0)) {
    var smartDrop = _doDropHeuristics(draggingMove.originalType,
        draggingMove.originalVariantString, draggingMove.originalWidth);

    var newEl = _createSegment(smartDrop.type,
        smartDrop.variantString, smartDrop.width, false, false, draggingMove.originalRandSeed);

    newEl.classList.add('create');

    if (draggingMove.segmentBeforeEl) {
      document.querySelector('#street-section-editable').
          insertBefore(newEl, draggingMove.segmentBeforeEl);
    } else if (draggingMove.segmentAfterEl) {
      document.querySelector('#street-section-editable').
          insertBefore(newEl, draggingMove.segmentAfterEl.nextSibling);
    } else {
      // empty street
      document.querySelector('#street-section-editable').appendChild(newEl);
    }

    window.setTimeout(function() {
      newEl.classList.remove('create');
    }, SHORT_DELAY);

    if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
      var draggedOutEl = document.querySelector('.segment.dragged-out');
      _removeElFromDom(draggedOutEl);
    }

    segmentElControls = newEl;
  } else {
    failedDrop = true;

    draggingMove.originalEl.classList.remove('dragged-out');

    segmentElControls = draggingMove.originalEl;
  }

  draggingMove.segmentBeforeEl = null;
  draggingMove.segmentAfterEl = null;

  _repositionSegments();
  _segmentsChanged();
  _updateWithinCanvas(true);

  _removeElFromDom(draggingMove.floatingEl);
  document.querySelector('#trashcan').classList.remove('visible');

  _changeDraggingType(DRAGGING_TYPE_NONE);

  if (segmentElControls) {
    _scheduleControlsFadeout(segmentElControls);
  }

  if (failedDrop) {
    _infoBubble.show(true);
  }
}

function _removeGuides(el) {
  var guideEl;
  while (guideEl = el.querySelector('.guide')) {
    _removeElFromDom(guideEl);
  }
}

function _handleSegmentResizeCancel() {
  _resizeSegment(draggingResize.segmentEl, RESIZE_TYPE_INITIAL,
      draggingResize.originalWidth * TILE_SIZE, true, false);

  _handleSegmentResizeEnd();
}

function _handleSegmentResizeEnd(event) {
  ignoreStreetChanges = false;

  _segmentsChanged();

  _changeDraggingType(DRAGGING_TYPE_NONE);

  var el = draggingResize.floatingEl;
  _removeElFromDom(el);

  draggingResize.segmentEl.classList.add('immediate-show-drag-handles');

  _removeGuides(draggingResize.segmentEl);

  _infoBubble.considerSegmentEl = draggingResize.segmentEl;
  _infoBubble.show(false);

  _scheduleControlsFadeout(draggingResize.segmentEl);

  _hideWidthChart();

  suppressMouseEnter = true;
  _infoBubble.considerShowing(event, draggingResize.segmentEl, INFO_BUBBLE_TYPE_SEGMENT);
  window.setTimeout(function() {
    suppressMouseEnter = false;
  }, 50);

  if (draggingResize.width && (draggingResize.originalWidth != draggingResize.width)) {
    _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH,
        TRACK_LABEL_DRAGGING, null, true);
  }
}

function _onBodyMouseUp(event) {
  switch (draggingType) {
    case DRAGGING_TYPE_NONE:
      return;
    case DRAGGING_TYPE_CLICK_OR_MOVE:
      _changeDraggingType(DRAGGING_TYPE_NONE);
      ignoreStreetChanges = false;

      // click!
      //_nextSegmentVariant(draggingMove.originalEl.dataNo);
      break;
    case DRAGGING_TYPE_MOVE:
      _handleSegmentMoveEnd(event);
      break;
    case DRAGGING_TYPE_RESIZE:
      _handleSegmentResizeEnd(event);
      break;
  }

  event.preventDefault();
}

function _createPalette() {
  for (var id in SEGMENT_INFO) {
    var segmentInfo = SEGMENT_INFO[id];

    if (segmentInfo.secret && !debug.secretSegments) {
      break;
    }

    var variantName;
    if (segmentInfo.paletteIcon) {
      variantName = segmentInfo.paletteIcon;
    } else {
      // TODO hack to get the first variant name
      for (var j in segmentInfo.details) {
        variantName = j;
        break;
      }
    }

    var variantInfo = segmentInfo.details[variantName];

    var dimensions = _getVariantInfoDimensions(variantInfo, 0, 1);

    var width = dimensions.right - dimensions.left;
    if (!width) {
      width = segmentInfo.defaultWidth;
    }
    width += PALETTE_EXTRA_SEGMENT_PADDING;

    var el = _createSegment(id,
      variantName,
      width * TILE_SIZE / WIDTH_PALETTE_MULTIPLIER,
      false,
      true,
      _generateRandSeed());

    el.classList.add('palette');

    document.querySelector('.palette-canvas').appendChild(el);
  }
}

function _resizeStreetWidth(dontScroll) {
  var width = street.width * TILE_SIZE;

  document.querySelector('#street-section-canvas').style.width = width + 'px';
  if (!dontScroll) {
    document.querySelector('#street-section-outer').scrollLeft =
        (width + BUILDING_SPACE * 2 - system.viewportWidth) / 2;
    _onStreetSectionScroll();
  }

  _onResize();
}

function _onResize() {
  system.viewportWidth = window.innerWidth;
  system.viewportHeight = window.innerHeight;

  var streetSectionHeight =
      document.querySelector('#street-section-inner').offsetHeight;

  var paletteTop =
      document.querySelector('#main-screen > footer').offsetTop || system.viewportHeight;

  // TODO const
  if (system.viewportHeight - streetSectionHeight > 450) {
    streetSectionTop =
        (system.viewportHeight - streetSectionHeight - 450) / 2 + 450 + 80;
  } else {
    streetSectionTop = system.viewportHeight - streetSectionHeight + 70;
  }

  if (readOnly) {
    streetSectionTop += 80;
  }

  // TODO const
  if (streetSectionTop + document.querySelector('#street-section-inner').offsetHeight >
    paletteTop - 20 + 180) { // gallery height
    streetSectionTop = paletteTop - 20 - streetSectionHeight + 180;
  }

  _updateGalleryShield();

  document.querySelector('#street-section-inner').style.top = streetSectionTop + 'px';

  document.querySelector('#street-section-sky').style.top =
      (streetSectionTop * .8) + 'px';

  document.querySelector('#street-scroll-indicator-left').style.top =
      (streetSectionTop + streetSectionHeight) + 'px';
  document.querySelector('#street-scroll-indicator-right').style.top =
      (streetSectionTop + streetSectionHeight) + 'px';

  var streetSectionDirtPos = system.viewportHeight - streetSectionTop - 400 + 180;

  document.querySelector('#street-section-dirt').style.height =
      streetSectionDirtPos + 'px';

  var skyTop = streetSectionTop;
  if (skyTop < 0) {
    skyTop = 0;
  }
  document.querySelector('#street-section-sky').style.paddingTop = skyTop + 'px';
  document.querySelector('#street-section-sky').style.marginTop = -skyTop + 'px';

  streetSectionCanvasLeft =
      ((system.viewportWidth - street.width * TILE_SIZE) / 2) - BUILDING_SPACE;
  if (streetSectionCanvasLeft < 0) {
    streetSectionCanvasLeft = 0;
  }
  document.querySelector('#street-section-canvas').style.left =
    streetSectionCanvasLeft + 'px';

  document.querySelector('#street-section-editable').style.width =
    (street.width * TILE_SIZE) + 'px';

  _resizeStreetName();

  _infoBubble.show(true);
  _updateScrollButtons();

  _updateBuildingPosition();
  // TODO hack
  _createBuildings();

  _updateStreetNameCanvasPos();
  _updateStreetScrollIndicators();
}

function _fillDefaultSegments() {
  street.segments = [];

  for (var i in DEFAULT_SEGMENTS[leftHandTraffic]) {
    var segment = DEFAULT_SEGMENTS[leftHandTraffic][i];
    segment.warnings = [];
    segment.variantString = _getVariantString(segment.variant);

    if (SEGMENT_INFO[segment.type].needRandSeed) {
      segment.randSeed = _generateRandSeed();
    }

    street.segments.push(segment);
  }

  _normalizeAllSegmentWidths();
}

function _createStreetWidthOption(width) {
  var el = document.createElement('option');
  el.value = width;
  el.innerHTML = _prettifyWidth(width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);
  return el;
}

function _buildStreetWidthMenu() {
  document.querySelector('#street-width').innerHTML = '';

  var el = document.createElement('option');
  el.disabled = true;
  el.innerHTML = 'Occupied width:';
  document.querySelector('#street-width').appendChild(el);

  var el = document.createElement('option');
  el.disabled = true;
  el.innerHTML = _prettifyWidth(street.occupiedWidth, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);
  document.querySelector('#street-width').appendChild(el);

  var el = document.createElement('option');
  el.disabled = true;
  document.querySelector('#street-width').appendChild(el);

  var el = document.createElement('option');
  el.disabled = true;
  el.innerHTML = 'Building-to-building width:';
  document.querySelector('#street-width').appendChild(el);

  var widths = [];

  for (var i in DEFAULT_STREET_WIDTHS) {
    var width = _normalizeStreetWidth(DEFAULT_STREET_WIDTHS[i]);
    var el = _createStreetWidthOption(width);
    document.querySelector('#street-width').appendChild(el);

    widths.push(width);
  }

  if (widths.indexOf(parseFloat(street.width)) == -1) {
    var el = document.createElement('option');
    el.disabled = true;
    document.querySelector('#street-width').appendChild(el);

    var el = _createStreetWidthOption(street.width);
    document.querySelector('#street-width').appendChild(el);
  }

  var el = document.createElement('option');
  el.value = STREET_WIDTH_CUSTOM;
  el.innerHTML = 'Different width…';
  document.querySelector('#street-width').appendChild(el);

  var el = document.createElement('option');
  el.disabled = true;
  document.querySelector('#street-width').appendChild(el);

  var el = document.createElement('option');
  el.value = STREET_WIDTH_SWITCH_TO_IMPERIAL;
  el.id = 'switch-to-imperial-units';
  el.innerHTML = msg('MENU_SWITCH_TO_IMPERIAL');
  if (street.units == SETTINGS_UNITS_IMPERIAL) {
    el.disabled = true;
  }
  document.querySelector('#street-width').appendChild(el);

  var el = document.createElement('option');
  el.value = STREET_WIDTH_SWITCH_TO_METRIC;
  el.id = 'switch-to-metric-units';
  el.innerHTML = msg('MENU_SWITCH_TO_METRIC');
  if (street.units == SETTINGS_UNITS_METRIC) {
    el.disabled = true;
  }

  document.querySelector('#street-width').appendChild(el);

  document.querySelector('#street-width').value = street.width;
}

function _onStreetWidthClick(event) {
  document.body.classList.add('edit-street-width');

  document.querySelector('#street-width').focus();

  window.setTimeout(function() {
    var trigger = document.createEvent('MouseEvents');
    trigger.initEvent('mousedown', true, true, window);
    document.querySelector('#street-width').dispatchEvent(trigger);
  }, 0);
}

function _onStreetWidthChange(event) {
  var el = event.target;
  var newStreetWidth = el.value;

  document.body.classList.remove('edit-street-width');

  if (newStreetWidth == street.width) {
    return;
  } else if (newStreetWidth == STREET_WIDTH_SWITCH_TO_METRIC) {
    _updateUnits(SETTINGS_UNITS_METRIC);
    return;
  } else if (newStreetWidth == STREET_WIDTH_SWITCH_TO_IMPERIAL) {
    _updateUnits(SETTINGS_UNITS_IMPERIAL);
    return;
  } else if (newStreetWidth == STREET_WIDTH_CUSTOM) {
    _ignoreWindowFocusMomentarily();

    var promptValue = street.occupiedWidth;
    if (promptValue < MIN_CUSTOM_STREET_WIDTH) promptValue = MIN_CUSTOM_STREET_WIDTH;
    if (promptValue > MAX_CUSTOM_STREET_WIDTH) promptValue = MAX_CUSTOM_STREET_WIDTH;

    // TODO string
    var width = prompt(
                  msg('PROMPT_NEW_STREET_WIDTH', {
                    minWidth: _prettifyWidth(MIN_CUSTOM_STREET_WIDTH, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP),
                    maxWidth: _prettifyWidth(MAX_CUSTOM_STREET_WIDTH, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP)
                  }), _prettifyWidth(promptValue, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP));

    if (width) {
      width = _normalizeStreetWidth(_processWidthInput(width));
    }

    if (!width) {
      _buildStreetWidthMenu();

      _loseAnyFocus();
      return;
    }

    if (width < MIN_CUSTOM_STREET_WIDTH) {
      width = MIN_CUSTOM_STREET_WIDTH;
    } else if (width > MAX_CUSTOM_STREET_WIDTH) {
      width = MAX_CUSTOM_STREET_WIDTH;
    }
    newStreetWidth = width;
  }

  street.width = _normalizeStreetWidth(newStreetWidth);
  _buildStreetWidthMenu();
  _resizeStreetWidth();

  initializing = true;

  _createDomFromData();
  _segmentsChanged();

  initializing = false;

  _loseAnyFocus();
}

function _nextSegmentVariant(dataNo) {
  var segment = street.segments[dataNo];

  var segmentInfo = SEGMENT_INFO[segment.type];

  var nextVariantString = '';
  var found = 0;
  for (var i in segmentInfo.details) {
    if (found == 1) {
      nextVariantString = i;
      break;
    }
    if (i == segment.variantString) {
      found = 1;
    }
  }

  if (!nextVariantString) {
    // TODO hack
    for (var i in segmentInfo.details) {
      nextVariantString = i;
      break;
    }
  }

  _changeSegmentVariant(dataNo, null, null, nextVariantString);
}

function _changeSegmentVariant(dataNo, variantName, variantChoice, variantString) {
  var segment = street.segments[dataNo];

  if (variantString) {
    segment.variantString = variantString;
    segment.variant = _getVariantArray(segment.type, segment.variantString);
  } else {
    segment.variant[variantName] = variantChoice;
    segment.variantString = _getVariantString(segment.variant);
  }

  var el = _createSegmentDom(segment);

  var oldEl = segment.el;
  oldEl.parentNode.insertBefore(el, oldEl);
  _switchSegmentElAway(oldEl);

  segment.el = el;
  segment.el.dataNo = oldEl.dataNo;
  street.segments[oldEl.dataNo].el = el;

  _switchSegmentElIn(el);
  el.classList.add('hover');
  el.classList.add('show-drag-handles');
  el.classList.add('immediate-show-drag-handles');
  el.classList.add('hide-drag-handles-when-inside-info-bubble');
  _infoBubble.segmentEl = el;

  _infoBubble.updateContents();

  _repositionSegments();
  _recalculateWidth();
  _applyWarningsToSegments();

  _saveStreetToServerIfNecessary();
}

function _removeSegment(el, all) {
  if (all) {
    street.segments = [];
    _createDomFromData();
    _segmentsChanged();

    _infoBubble.hide();

    _statusMessage.show(msg('STATUS_ALL_SEGMENTS_DELETED'), true);
  } else if (el && el.parentNode) {
    _infoBubble.hide();
    _infoBubble.hideSegment();
    _switchSegmentElAway(el);
    _segmentsChanged();

    _statusMessage.show(msg('STATUS_SEGMENT_DELETED'), true);
  }

  /*if (street.segments.length) {
    _showWidthChartImmediately();
    _hideWidthChart();
  }*/
}

function _getHoveredSegmentEl() {
  var el = document.querySelector('.segment.hover');
  return el;
}

function _getHoveredEl() {
  var el = document.querySelector('.hover');
  return el;
}

function _onBodyKeyDown(event) {
  switch (event.keyCode) {
    case KEYS.SLASH:
      _onHelpMenuClick();
      break;

    case KEYS.EQUAL:
    case KEYS.EQUAL_ALT:
    case KEYS.PLUS_KEYPAD:
    case KEYS.MINUS:
    case KEYS.MINUS_ALT:
    case KEYS.MINUS_KEYPAD:
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      var negative = (event.keyCode == KEYS.MINUS) ||
         (event.keyCode == KEYS.MINUS_ALT) ||
         (event.keyCode == KEYS.MINUS_KEYPAD);

      var hoveredEl = _getHoveredEl();
      if (hoveredEl) {
        if (hoveredEl.classList.contains('segment')) {
          _incrementSegmentWidth(hoveredEl, !negative, event.shiftKey);
        } else if (hoveredEl.id == 'street-section-left-building') {
          _changeBuildingHeight(true, !negative);
        } else if (hoveredEl.id == 'street-section-right-building') {
          _changeBuildingHeight(false, !negative);
        }
        event.preventDefault();

        _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH,
            TRACK_LABEL_KEYBOARD, null, true);
      }
      break;
    case KEYS.BACKSPACE:
    case KEYS.DELETE:
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      var segmentHoveredEl = _getHoveredSegmentEl();
      _removeSegment(segmentHoveredEl, event.shiftKey);

      _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_REMOVE_SEGMENT,
          TRACK_LABEL_KEYBOARD, null, true);

      event.preventDefault();
      break;
    case KEYS.LEFT_ARROW:
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      _scrollStreet(true, event.shiftKey);
      event.preventDefault();
      break;
    case KEYS.RIGHT_ARROW:
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      _scrollStreet(false, event.shiftKey);
      event.preventDefault();
      break;
    case KEYS.Z:
      if (!event.shiftKey && (event.metaKey || event.ctrlKey)) {
        _undo();
        event.preventDefault();
      } else if (event.shiftKey && (event.metaKey || event.ctrlKey)) {
        _redo();
        event.preventDefault();
      }
      break;
    case KEYS.S:
      if (event.metaKey || event.ctrlKey) {
        _statusMessage.show(msg('STATUS_NO_NEED_TO_SAVE'));
        event.preventDefault();
      }
      break;
    case KEYS.Y:
      if (event.metaKey || event.ctrlKey) {
        _redo();
        event.preventDefault();
      }
      break;
    case KEYS.D:
      if (event.shiftKey) {
        _showDebugInfo();
        event.preventDefault();
      }
      break;
    }
}

function _onGlobalKeyDown(event) {
  if (_isFocusOnBody()) {
    _onBodyKeyDown(event);
  }

  switch (event.keyCode) {
    case KEYS.ESC:
      if (document.querySelector('#debug').classList.contains('visible')) {
        _hideDebugInfo();
      } else if (document.querySelector('#welcome').classList.contains('visible')) {
        _hideWelcome();
      } else if (document.querySelector('#save-as-image-dialog').classList.contains('visible')) {
        _hideSaveAsImageDialogBox();
      } else if (document.querySelector('#about').classList.contains('visible')) {
        _hideAboutDialogBox();
      } else if (draggingType == DRAGGING_TYPE_RESIZE) {
        _handleSegmentResizeCancel();
      } else if (draggingType == DRAGGING_TYPE_MOVE) {
        _handleSegmentMoveCancel();
      } else if (menuVisible) {
        _hideMenus();
      } else if (document.querySelector('#status-message').classList.contains('visible')) {
        _statusMessage.hide();
      } else if (_infoBubble.visible && _infoBubble.descriptionVisible) {
        _infoBubble.hideDescription();
      } else if (_infoBubble.visible) {
        _infoBubble.hide();
        _infoBubble.hideSegment(false);
      } else if (document.body.classList.contains('gallery-visible')) {
        _hideGallery(false);
      } else if (signedIn) {
        _showGallery(signInData.userId, false);
      } else {
        return;
      }

      event.preventDefault();
      break;
  }
}

function _onRemoveButtonClick(event) {
  var el = event.target.segmentEl;

  if (el) {
    _removeSegment(el, event.shiftKey);

    _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_REMOVE_SEGMENT,
        TRACK_LABEL_BUTTON, null, true);
  }

  // Prevent this “leaking” to a segment below
  event.preventDefault();
}

function _normalizeSlug(slug) {
  slug = slug.toLowerCase();
  slug = slug.replace(/ /g, '-');
  slug = slug.replace(/-{2,}/, '-');
  slug = slug.replace(/[^a-zA-Z0-9\-]/g, '');
  slug = slug.replace(/^[-]+|[-]+$/g, '');

  return slug;
}

function _getStreetUrl(street) {
  var url = '/';

  if (street.creatorId) {
    if (RESERVED_URLS.indexOf(street.creatorId) != -1) {
      url += URL_RESERVED_PREFIX;
    }

    url += street.creatorId;
  } else {
    url += URL_NO_USER;
  }

  url += '/';

  url += street.namespacedId;

  if (street.creatorId) {
    var slug = _normalizeSlug(street.name);
    url += '/' + encodeURIComponent(slug);
  }

  return url;
}

function _updatePageUrl(forceGalleryUrl) {
  if (forceGalleryUrl) {
    var url = '/' + galleryUserId;
  } else {
    var url = _getStreetUrl(street);
  }

  if (debug.hoverPolygon) {
    // TODO const
    url += '&debug-hover-polygon';
  }
  if (debug.canvasRectangles) {
    // TODO const
    url += '&debug-canvas-rectangles';
  }
  if (debug.forceLeftHandTraffic) {
    url += '&debug-force-left-hand-traffic';
  }
  if (debug.forceMetric) {
    url += '&debug-force-metric';
  }
  if (debug.forceUnsupportedBrowser) {
    url += '&debug-force-unsupported-browser';
  }
  if (debug.forceNonRetina) {
    url += '&debug-force-non-retina';
  }
  if (debug.secretSegments) {
    url += '&debug-secret-segments';
  }
  if (debug.forceReadOnly) {
    url += '&debug-force-read-only';
  }
  if (debug.forceTouch) {
    url += '&debug-force-touch';
  }
  if (debug.forceLiveUpdate) {
    url += '&debug-force-live-update';
  }

  url = url.replace(/\&/, '?');

  window.history.replaceState(null, null, url);

  _updateShareMenu();
}

function _updatePageTitle() {
  // TODO const/interpolate
  var title = street.name;

  if (street.creatorId && (!signedIn || (signInData.userId != street.creatorId))) {
    title += ' (by ' + street.creatorId + ')';
  }

  title += ' – Streetmix';

  document.title = title;
}

// TODO unify with above (this one doesn’t have author, for Facebook sharing)
function _getPageTitle() {
  return street.name + '– Streetmix';
}

function _onAnotherUserIdClick(event) {
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    return;
  }

  var el = event.target;

  var userId = el.innerHTML;

  _showGallery(userId, false);

  event.preventDefault();
}

function _updateStreetMetadata() {
  var html = _prettifyWidth(street.width, PRETTIFY_WIDTH_OUTPUT_MARKUP) + ' width';
  document.querySelector('#street-width-read-width').innerHTML = html;

  if (street.remainingWidth > 0) {
    var html = '<span class="under">(' + _prettifyWidth(street.remainingWidth, PRETTIFY_WIDTH_OUTPUT_MARKUP) + ' room)</span>';
  } else if (street.remainingWidth < 0) {
    var html = '<span class="over">(' + _prettifyWidth(-street.remainingWidth, PRETTIFY_WIDTH_OUTPUT_MARKUP) + ' over)</span>';
  } else {
    var html = '';
  }
  document.querySelector('#street-width-read-difference').innerHTML = html;

  if (street.creatorId && (!signedIn || (street.creatorId != signInData.userId))) {
    // TODO const
    var html = "by <div class='avatar' userId='" + street.creatorId + "'></div>" +
        "<a class='user-gallery' href='/" +
        street.creatorId + "'>" + street.creatorId + "</a>";

    document.querySelector('#street-metadata-author').innerHTML = html;

    _fetchAvatars();

    if (!readOnly) {
      document.querySelector('#street-metadata-author .user-gallery').
          addEventListener('click', _onAnotherUserIdClick);
    }
  } else if (!street.creatorId && (signedIn || remixOnFirstEdit)) {
    var html = 'by ' + msg('USER_ANONYMOUS');

    document.querySelector('#street-metadata-author').innerHTML = html;
  } else {
    document.querySelector('#street-metadata-author').innerHTML = '';
  }

  var html = _formatDate(moment(street.updatedAt));
  document.querySelector('#street-metadata-date').innerHTML = html;
}

// Because Firefox is stupid and their prompt() dialog boxes are not quite
// modal.
function _ignoreWindowFocusMomentarily() {
  ignoreWindowFocus = true;
  window.setTimeout(function() {
    ignoreWindowFocus = false;
  }, 50);
}

function _onWindowFocus() {
  if (abortEverything || ignoreWindowFocus) {
    return;
  }

  if (!galleryVisible) {
    _fetchStreetForVerification();

    // Save settings on window focus, so the last edited street is the one you’re
    // currently looking at (in case you’re looking at many streets in various
    // tabs)
    _saveSettingsLocally();
  }
}

function _onWindowBlur() {
  if (abortEverything) {
    return;
  }

  _hideMenus();
}

function _onStorageChange() {
  if (signedIn && !window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
    mode = MODES.FORCE_RELOAD_SIGN_OUT;
    _processMode();
  } else if (!signedIn && window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
    mode = MODES.FORCE_RELOAD_SIGN_IN;
    _processMode();
  }
}

function _makeDefaultStreet() {
  ignoreStreetChanges = true;
  _prepareDefaultStreet();
  _setUpdateTimeToNow();

  _resizeStreetWidth();
  _updateStreetName();
  _createDomFromData();
  _segmentsChanged();
  _updateShareMenu();

  ignoreStreetChanges = false;
  lastStreet = _trimStreetData(street);

  _saveStreetToServer(false);
}

function _onNewStreetDefaultClick() {
  settings.newStreetPreference = NEW_STREET_DEFAULT;
  _saveSettingsLocally();

  _makeDefaultStreet();
}

function _onNewStreetEmptyClick() {
  settings.newStreetPreference = NEW_STREET_EMPTY;
  _saveSettingsLocally();

  ignoreStreetChanges = true;
  _prepareEmptyStreet();

  _resizeStreetWidth();
  _updateStreetName();
  _createDomFromData();
  _segmentsChanged();
  _updateShareMenu();

  ignoreStreetChanges = false;
  lastStreet = _trimStreetData(street);

  _saveStreetToServer(false);
}

function _onNewStreetLastClick() {
  _fetchLastStreet();
}

function _showWelcome() {
  if (readOnly || system.phone) {
    return;
  }

  var welcomeType = WELCOME_NONE;

   _loadSettingsWelcomeDismissed();

  if (mode == MODES.NEW_STREET) {
    if (signedIn || settingsWelcomeDismissed) {
      welcomeType = WELCOME_NEW_STREET;
    } else {
      welcomeType = WELCOME_FIRST_TIME_NEW_STREET;
    }
  } else {
    if (!settingsWelcomeDismissed) {
      welcomeType = WELCOME_FIRST_TIME_EXISTING_STREET;
    }
  }


  if (welcomeType == WELCOME_NONE) {
    return;
  }

  switch (welcomeType) {
    case WELCOME_FIRST_TIME_NEW_STREET:
      document.querySelector('#welcome').classList.add('first-time-new-street');
      break;
    case WELCOME_FIRST_TIME_EXISTING_STREET:
      document.querySelector('#welcome').classList.add('first-time-existing-street');

      document.querySelector('#welcome-new-street').addEventListener('click', function() {
        settingsWelcomeDismissed = true;
        _saveSettingsWelcomeDismissed();
        _goNewStreet(true);
      });

      $('#welcome-street-name').text(street.name);

      if (street.creatorId) {
        document.querySelector('#welcome-avatar-creator').classList.add('visible');
        $('#welcome-avatar').attr('userId', street.creatorId);
        $('#welcome-creator').text(street.creatorId);
      }
      _fetchAvatars();
      break;
    case WELCOME_NEW_STREET:
      document.querySelector('#welcome').classList.add('new-street');

      switch (settings.newStreetPreference) {
        case NEW_STREET_EMPTY:
          document.querySelector('#new-street-empty').checked = true;
          break;
        case NEW_STREET_DEFAULT:
          document.querySelector('#new-street-default').checked = true;
          break;
      }

      if (settings.priorLastStreetId && settings.priorLastStreetId != street.id) {
        document.querySelector('#new-street-last').parentNode.classList.add('visible');
      }
      break;
  }

  document.querySelector('#welcome').classList.add('visible');
  document.querySelector('#street-name-canvas').classList.add('hidden');
}

function _hideWelcome() {
  settingsWelcomeDismissed = true;
  _saveSettingsWelcomeDismissed();

  document.querySelector('#welcome').classList.remove('visible');
  document.querySelector('#street-name-canvas').classList.remove('hidden');
}

function _showAboutDialogBox(event) {
  if (event && (event.shiftKey || event.ctrlKey || event.metaKey)) {
    return;
  }

  _hideMenus();

  document.querySelector('#about').classList.add('visible');
  document.querySelector('#dialog-box-shield').classList.add('visible');

  var els = document.querySelectorAll('#about .avatar');
  for (var i = 0, el; el = els[i]; i++) {
    el.removeAttribute('postpone');
  }

  window.history.replaceState(null, null, URL_HELP_ABOUT);

  _fetchAvatars();

  if (event) {
    event.preventDefault();
  }
}

function _hideAboutDialogBox() {
  document.querySelector('#about').classList.remove('visible');
  document.querySelector('#dialog-box-shield').classList.remove('visible');

  _updatePageUrl();
}

function _formatDate(date) {
  // TODO hack
  var today = moment(new Date().getTime());
  var todayFormat = today.format(DATE_FORMAT);
  var dateFormat = date.format(DATE_FORMAT);

  if (dateFormat != todayFormat) {
    return dateFormat;
  } else {
    return '';
  }
}

function _clearBlockingShieldTimers() {
  window.clearTimeout(blockingShieldTimerId);
  window.clearTimeout(blockingShieldTooSlowTimerId);
}

function _showBlockingShield(message) {
  if (!message) {
    message = msg('LOADING');
  }

  _hideBlockingShield();
  _clearBlockingShieldTimers();

  document.querySelector('#blocking-shield .message').innerHTML = message;
  document.querySelector('#blocking-shield').classList.add('visible');

  blockingShieldTimerId = window.setTimeout(function() {
    document.querySelector('#blocking-shield').classList.add('darken');
  }, BLOCKING_SHIELD_DARKEN_DELAY);

  blockingShieldTooSlowTimerId = window.setTimeout(function() {
    document.querySelector('#blocking-shield').classList.add('show-too-slow');
  }, BLOCKING_SHIELD_TOO_SLOW_DELAY);
}

function _darkenBlockingShield(message) {
  _clearBlockingShieldTimers();
  document.querySelector('#blocking-shield').classList.add('darken-immediately');
}

function _hideBlockingShield() {
  _clearBlockingShieldTimers();
  document.querySelector('#blocking-shield').classList.remove('visible');
  document.querySelector('#blocking-shield').classList.remove('darken');
  document.querySelector('#blocking-shield').classList.remove('darken-immediately');
  document.querySelector('#blocking-shield').classList.remove('show-try-again');
  document.querySelector('#blocking-shield').classList.remove('show-too-slow');
  document.querySelector('#blocking-shield').classList.remove('show-cancel');
}

function _sendDeleteStreetToServer(id) {
  // Prevents new street submenu from showing the last street
  if (settings.lastStreetId == id) {
    settings.lastStreetId = null;
    settings.lastStreetCreatorId = null;
    settings.lastStreetNamespacedId = null;

    _saveSettingsLocally();
    _saveSettingsToServer();
  }

  _newNonblockingAjaxRequest({
    // TODO const
    url: API_URL + 'v1/streets/' + id,
    dataType: 'json',
    type: 'DELETE',
    headers: { 'Authorization': _getAuthHeader() }
  }, false);
}

function _onMyStreetsClick(event) {
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    return;
  }

  if (signedIn) {
    _showGallery(signInData.userId, false);
  } else {
    _showGallery(false, false, true);
  }

  event.preventDefault();
}

function _onVisibilityChange() {
  var hidden = document.hidden || document.webkitHidden ||
      document.msHidden || document.mozHidden;

  if (hidden) {
    _onWindowBlur();
  } else {
    _onWindowFocus();
  }
}

// TODO hack
function _hideDialogBoxes() {
  _hideAboutDialogBox();
  _hideSaveAsImageDialogBox();
}

function _addEventListeners() {
  window.addEventListener('beforeprint', function() { _onBeforePrint(false); } );
  window.addEventListener('afterprint', function() { _onAfterPrint(false); } );

  var mediaQueryList = window.matchMedia('print');
  mediaQueryList.addListener(function(mql) {
    if (mql.matches) {
      _onBeforePrint(true);
    } else {
      _onAfterPrint(true);
    }
  });

  document.querySelector('#invoke-print').addEventListener('click', _print);

  document.querySelector('#share-via-twitter').addEventListener('click', _shareViaTwitter);
  document.querySelector('#share-via-facebook').addEventListener('click', _shareViaFacebook);

  if (system.touch) {
    document.querySelector('#dialog-box-shield').addEventListener('touchstart', _hideDialogBoxes);
  } else {
    document.querySelector('#dialog-box-shield').addEventListener('click', _hideDialogBoxes);
  }
  document.querySelector('#about .close').addEventListener('click', _hideAboutDialogBox);

  document.querySelector('#about-streetmix').addEventListener('click', _showAboutDialogBox);

  document.querySelector('#street-scroll-indicator-left').addEventListener('click', _onStreetLeftScrollClick);
  document.querySelector('#street-scroll-indicator-right').addEventListener('click', _onStreetRightScrollClick);

  if (system.touch) {
    document.querySelector('#welcome .close').addEventListener('touchstart', _hideWelcome);
  } else {
    document.querySelector('#welcome .close').addEventListener('click', _hideWelcome);
  }
  document.querySelector('#save-as-image-dialog .close').addEventListener('click', _hideSaveAsImageDialogBox);

  document.querySelector('#save-as-image').addEventListener('click', _showSaveAsImageDialogBox);

  document.querySelector('#save-as-image-transparent-sky').addEventListener('click', _updateSaveAsImageOptions);
  document.querySelector('#save-as-image-segment-names').addEventListener('click', _updateSaveAsImageOptions);
  document.querySelector('#save-as-image-street-name').addEventListener('click', _updateSaveAsImageOptions);

  document.querySelector('#street-section-outer').addEventListener('scroll', _onStreetSectionScroll);

  if (!system.touch) {
    $('#street-section-left-building').mouseenter(_onBuildingMouseEnter);
    $('#street-section-left-building').mouseleave(_onBuildingMouseLeave);
    $('#street-section-right-building').mouseenter(_onBuildingMouseEnter);
    $('#street-section-right-building').mouseleave(_onBuildingMouseLeave);
  } else {
    document.querySelector('#street-section-left-building').addEventListener('touchstart', _onBuildingMouseEnter);
    document.querySelector('#street-section-right-building').addEventListener('touchstart', _onBuildingMouseEnter);
  }

  if (!system.touch) {
    $('.info-bubble').mouseenter(_infoBubble.onMouseEnter);
    $('.info-bubble').mouseleave(_infoBubble.onMouseLeave);
  }
  document.querySelector('.info-bubble').addEventListener('touchstart', _infoBubble.onTouchStart);

  document.querySelector('#feedback-form-message').addEventListener('input', _onFeedbackFormInput);
  document.querySelector('#feedback-form-email').addEventListener('input', _onFeedbackFormInput);
  document.querySelector('#feedback-form-email').addEventListener('keydown', _onFeedbackFormEmailKeyDown);
  document.querySelector('#feedback-form-send').addEventListener('click', _feedbackFormSend);

  document.querySelector('#gallery-try-again').addEventListener('click', _repeatReceiveGalleryData);

  document.querySelector('#no-connection-try-again').addEventListener('click', _nonblockingAjaxTryAgain);

  document.querySelector('#blocking-shield-cancel').addEventListener('click', _blockingCancel);
  document.querySelector('#blocking-shield-try-again').addEventListener('click', _blockingTryAgain);
  document.querySelector('#blocking-shield-reload').addEventListener('click', _goReload);
  document.querySelector('#gallery-shield').addEventListener('click', _onGalleryShieldClick);

  document.querySelector('#new-street-default').addEventListener('click', _onNewStreetDefaultClick);
  document.querySelector('#new-street-empty').addEventListener('click', _onNewStreetEmptyClick);
  document.querySelector('#new-street-last').addEventListener('click', _onNewStreetLastClick);

  window.addEventListener('storage', _onStorageChange);

  if (system.touch) {
    document.querySelector('#gallery-link a').addEventListener('touchstart', _onMyStreetsClick);
  } else {
    document.querySelector('#gallery-link a').addEventListener('click', _onMyStreetsClick);
  }

  document.querySelector('#sign-out-link').addEventListener('click', _onSignOutClick);

  /*if (system.pageVisibility) {
    document.addEventListener('visibilitychange', _onVisibilityChange, false);
    document.addEventListener('webkitvisibilitychange', _onVisibilityChange, false);
    document.addEventListener('mozvisibilitychange', _onVisibilityChange, false);
    document.addEventListener('msvisibilitychange', _onVisibilityChange, false);
  }*/
  window.addEventListener('focus', _onWindowFocus);
  window.addEventListener('blur', _onWindowBlur);

  window.addEventListener('beforeunload', _onWindowBeforeUnload);

  if (!readOnly) {
    if (system.touch) {
      document.querySelector('#street-name').addEventListener('touchstart', _askForStreetName);
    } else {
      document.querySelector('#street-name').addEventListener('click', _askForStreetName);
    }
  }

  if (system.touch) {
    document.querySelector('#undo').addEventListener('touchstart', _undo);
    document.querySelector('#redo').addEventListener('touchstart', _redo);
  } else {
    document.querySelector('#undo').addEventListener('click', _undo);
    document.querySelector('#redo').addEventListener('click', _redo);
  }

  if (!readOnly) {
    document.querySelector('#street-width-read').addEventListener('click', _onStreetWidthClick);

    document.querySelector('#street-width').
        addEventListener('change', _onStreetWidthChange);
  }

  window.addEventListener('resize', _onResize);

  $(document).mouseleave(_onBodyMouseOut);

  if (!system.touch) {
    window.addEventListener('mousedown', _onBodyMouseDown);
    window.addEventListener('mousemove', _onBodyMouseMove);
    window.addEventListener('mouseup', _onBodyMouseUp);
  } else {
    window.addEventListener('touchstart', _onBodyMouseDown);
    window.addEventListener('touchmove', _onBodyMouseMove);
    window.addEventListener('touchend', _onBodyMouseUp);
  }
  window.addEventListener('keydown', _onGlobalKeyDown);

  /*if (system.touch) {
    document.querySelector('#share-menu-button').
        addEventListener('touchstart', _onShareMenuClick);
    document.querySelector('#feedback-menu-button').
        addEventListener('touchstart', _onFeedbackMenuClick);
    if (document.querySelector('#identity-menu-button')) {
      document.querySelector('#identity-menu-button').
          addEventListener('touchstart', _onIdentityMenuClick);
    }
  } else {*/
    // Firefox sometimes disables some buttons… unsure why
    document.querySelector('#share-menu-button').disabled = false;
    document.querySelector('#help-menu-button').disabled = false;
    document.querySelector('#feedback-menu-button').disabled = false;
    if (document.querySelector('#identity-menu-button')) {
      document.querySelector('#identity-menu-button').disabled = false;
    }

    document.querySelector('#share-menu-button').
        addEventListener('click', _onShareMenuClick);
    document.querySelector('#help-menu-button').
        addEventListener('click', _onHelpMenuClick);
    document.querySelector('#feedback-menu-button').
        addEventListener('click', _onFeedbackMenuClick);
    if (document.querySelector('#identity-menu-button')) {
      document.querySelector('#identity-menu-button').
          addEventListener('click', _onIdentityMenuClick);
    }
  //}
}

function _addBodyClasses() {
  document.body.classList.add('environment-' + ENV);

  if (system.windows) {
    document.body.classList.add('windows');
  }

  if (system.safari) {
    document.body.classList.add('safari');
  }

  if (system.touch) {
    document.body.classList.add('touch-support');
  }

  if (readOnly) {
    document.body.classList.add('read-only');
  }

  if (system.phone) {
    document.body.classList.add('phone');
  }
}

function _detectSystemCapabilities() {

  // NOTE:
  // This function might be called on very old browsers. Please make
  // sure not to use modern faculties.

  if (debug.forceTouch) {
    system.touch = true;
  } else {
    system.touch = Modernizr.touch;
  }
  system.pageVisibility = Modernizr.pagevisibility;
  if (debug.forceNonRetina) {
    system.hiDpi = 1.0;
  } else {
    system.hiDpi = window.devicePixelRatio || 1.0;
  }

  if ((typeof matchMedia != 'undefined') &&
      matchMedia('only screen and (max-device-width: 480px)').matches) {
    system.phone = true;
  } else {
    system.phone = false;
  }

  system.cssTransform = false;
  var el = document.createElement('div');
  for (var i in CSS_TRANSFORMS) {
    if (typeof el.style[CSS_TRANSFORMS[i]] != 'undefined') {
      system.cssTransform = CSS_TRANSFORMS[i];
      break;
    }
  }

  if (navigator.userAgent.indexOf('Windows') != -1) {
    system.windows = true;
  }

  if ((navigator.userAgent.indexOf('Safari') != -1) &&
      (navigator.userAgent.indexOf('Chrome') == -1)) {
    system.safari = true;
  }

  if (system.phone || debug.forceReadOnly) {
    readOnly = true;
  }

  var meta = document.createElement('meta');
  meta.setAttribute('name', 'viewport');
  if (system.phone) {
    meta.setAttribute('content', 'initial-scale=.5, maximum-scale=.5');
  } else {
    meta.setAttribute('content', 'initial-scale=1, maximum-scale=1');
  }
  var headEls = document.getElementsByTagName('head');
  headEls[0].appendChild(meta);

  var language = window.navigator.userLanguage || window.navigator.language;
  if (language) {
    var language = language.substr(0, 2).toUpperCase();
    _updateSettingsFromCountryCode(language);
  }
}

function _isPointInPoly(vs, point) {
  var x = point[0], y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0], yi = vs[i][1];
    var xj = vs[j][0], yj = vs[j][1];

    var intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

function _switchSegmentElIn(el) {
  el.classList.add('switching-in-pre');

  window.setTimeout(function() {
    var pos = _getElAbsolutePos(el);
    var perspective = -(pos[0] - document.querySelector('#street-section-outer').scrollLeft - system.viewportWidth / 2);
    // TODO const
    // TODO cross-browser

    el.style.webkitPerspectiveOrigin = (perspective / 2) + 'px 50%';
    el.style.MozPerspectiveOrigin = (perspective / 2) + 'px 50%';
    el.style.perspectiveOrigin = (perspective / 2) + 'px 50%';

    el.classList.add('switching-in-post');
  }, SEGMENT_SWITCHING_TIME / 2);

  window.setTimeout(function() {
    el.classList.remove('switching-in-pre');
    el.classList.remove('switching-in-post');
  }, SEGMENT_SWITCHING_TIME * 1.5);
}

function _switchSegmentElAway(el) {
  var pos = _getElAbsolutePos(el);

  // TODO func
  var perspective = -(pos[0] - document.querySelector('#street-section-outer').scrollLeft - system.viewportWidth / 2);
  // TODO const
  // TODO cross-browser

  el.style.webkitPerspectiveOrigin = (perspective / 2) + 'px 50%';
  el.style.MozPerspectiveOrigin = (perspective / 2) + 'px 50%';
  el.style.perspectiveOrigin = (perspective / 2) + 'px 50%';

  el.parentNode.removeChild(el);
  el.classList.remove('hover');
  el.classList.add('switching-away-pre');
  el.style.left = (pos[0] - document.querySelector('#street-section-outer').scrollLeft) + 'px';
  el.style.top = pos[1] + 'px';
  document.body.appendChild(el);

  window.setTimeout(function() {
    el.classList.add('switching-away-post');
  }, 0);

  window.setTimeout(function() {
    _removeElFromDom(el);
  }, SEGMENT_SWITCHING_TIME);
}

var _eventTracking = {
  alreadyTracked: [],

  track: function(category, action, label, value, onlyFirstTime) {
    if (onlyFirstTime) {
      var id = category + '|' + action + '|' + label;

      if (_eventTracking.alreadyTracked[id]) {
        return;
      }
    }

    // console.log('Event tracked', category, action, label);

    ga && ga('send', 'event', category, action, label, value);

    if (onlyFirstTime) {
      _eventTracking.alreadyTracked[id] = true;
    }
  }
}

var _infoBubble = {
  mouseInside: false,

  visible: false,
  el: null,

  descriptionVisible: false,

  startMouseX: null,
  startMouseY: null,
  hoverPolygon: null,
  segmentEl: null,
  type: null,

  lastMouseX: null,
  lastMouseY: null,

  suppressed: false,

  bubbleX: null,
  bubbleY: null,
  bubbleWidth: null,
  bubbleHeight: null,

  considerMouseX: null,
  considerMouseY: null,
  considerSegmentEl: null,
  considerType: null,

  hoverPolygonUpdateTimerId: -1,
  suppressTimerId: -1,

  suppress: function() {
    if (!_infoBubble.suppressed) {
      _infoBubble.hide();
      _infoBubble.hideSegment(true);
      //_infoBubble.el.classList.add('suppressed');
      _infoBubble.suppressed = true;
    }

    window.clearTimeout(_infoBubble.suppressTimerId);
    _infoBubble.suppressTimerId = window.setTimeout(_infoBubble.unsuppress, 100);
  },

  unsuppress: function() {
    //_infoBubble.el.classList.remove('suppressed');
    _infoBubble.suppressed = false;

    window.clearTimeout(_infoBubble.suppressTimerId);
  },

  onTouchStart: function() {
    _resumeFadeoutControls();
  },

  onMouseEnter: function() {
    if (_infoBubble.segmentEl) {
      _infoBubble.segmentEl.classList.add('hide-drag-handles-when-inside-info-bubble');
    }

    _infoBubble.mouseInside = true;

    _infoBubble.updateHoverPolygon();
  },

  onMouseLeave: function() {
    if (_infoBubble.segmentEl) {
      _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-inside-info-bubble');
    }

    _infoBubble.mouseInside = false;
  },

  _withinHoverPolygon: function(x, y) {
    return _isPointInPoly(_infoBubble.hoverPolygon, [x, y]);
  },

  updateHoverPolygon: function(mouseX, mouseY) {
    if (!_infoBubble.visible) {
      _infoBubble.hideDebugHoverPolygon();
      return;
    }

    var bubbleX = _infoBubble.bubbleX;
    var bubbleY = _infoBubble.bubbleY;
    var bubbleWidth = _infoBubble.bubbleWidth;
    var bubbleHeight = _infoBubble.bubbleHeight;

    if (_infoBubble.descriptionVisible) {
      // TODO const
      var marginBubble = 200;
    } else {
      var marginBubble = INFO_BUBBLE_MARGIN_BUBBLE;
    }

    if (_infoBubble.mouseInside && !_infoBubble.descriptionVisible) {
      var pos = _getElAbsolutePos(_infoBubble.segmentEl);

      var x = pos[0] - document.querySelector('#street-section-outer').scrollLeft;

      var segmentX1 = x - INFO_BUBBLE_MARGIN_BUBBLE;
      var segmentX2 = x + _infoBubble.segmentEl.offsetWidth + INFO_BUBBLE_MARGIN_BUBBLE;

      var segmentY = pos[1] + _infoBubble.segmentEl.offsetHeight + INFO_BUBBLE_MARGIN_BUBBLE;

      _infoBubble.hoverPolygon = [
        [bubbleX - marginBubble, bubbleY - marginBubble],
        [bubbleX - marginBubble, bubbleY + bubbleHeight + marginBubble],
        [segmentX1, bubbleY + bubbleHeight + marginBubble + 120],
        [segmentX1, segmentY],
        [segmentX2, segmentY],
        [segmentX2, bubbleY + bubbleHeight + marginBubble + 120],
        [bubbleX + bubbleWidth + marginBubble, bubbleY + bubbleHeight + marginBubble],
        [bubbleX + bubbleWidth + marginBubble, bubbleY - marginBubble],
        [bubbleX - marginBubble, bubbleY - marginBubble]
      ];
    } else {
      var bottomY = mouseY - INFO_BUBBLE_MARGIN_MOUSE;
      if (bottomY < bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE) {
        bottomY = bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE;
      }
      var bottomY2 = mouseY + INFO_BUBBLE_MARGIN_MOUSE;
      if (bottomY2 < bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE) {
        bottomY2 = bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE;
      }

    if (_infoBubble.descriptionVisible) {
      bottomY = bubbleY + bubbleHeight + marginBubble;
      bottomY2 = bottomY;
    }


      var diffX = 60 - (mouseY - bubbleY) / 5;
      if (diffX < 0) {
        diffX = 0;
      } else if (diffX > 50) {
        diffX = 50;
      }

      _infoBubble.hoverPolygon = [
        [bubbleX - marginBubble, bubbleY - marginBubble],
        [bubbleX - marginBubble, bubbleY + bubbleHeight + marginBubble],
        [(bubbleX - marginBubble + mouseX - INFO_BUBBLE_MARGIN_MOUSE - diffX) / 2, bottomY + (bubbleY + bubbleHeight + marginBubble - bottomY) * .2],
        [mouseX - INFO_BUBBLE_MARGIN_MOUSE - diffX, bottomY],
        [mouseX - INFO_BUBBLE_MARGIN_MOUSE, bottomY2],
        [mouseX + INFO_BUBBLE_MARGIN_MOUSE, bottomY2],
        [mouseX + INFO_BUBBLE_MARGIN_MOUSE + diffX, bottomY],
        [(bubbleX + bubbleWidth + marginBubble + mouseX + INFO_BUBBLE_MARGIN_MOUSE + diffX) / 2, bottomY + (bubbleY + bubbleHeight + marginBubble - bottomY) * .2],
        [bubbleX + bubbleWidth + marginBubble, bubbleY + bubbleHeight + marginBubble],
        [bubbleX + bubbleWidth + marginBubble, bubbleY - marginBubble],
        [bubbleX - marginBubble, bubbleY - marginBubble]
      ];
    }

    _infoBubble.drawDebugHoverPolygon();
  },

  hideDebugHoverPolygon: function() {
    if (!debug.hoverPolygon) {
      return;
    }

    var el = document.querySelector('#debug-hover-polygon canvas');

    el.width = el.width; // clear
  },

  drawDebugHoverPolygon: function() {
    if (!debug.hoverPolygon) {
      return;
    }

    _infoBubble.hideDebugHoverPolygon();
    var el = document.querySelector('#debug-hover-polygon canvas');

    var ctx = el.getContext('2d');
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'rgba(255, 0, 0, .1)';
    ctx.beginPath();
    ctx.moveTo(_infoBubble.hoverPolygon[0][0], _infoBubble.hoverPolygon[0][1]);
    for (var i = 1; i < _infoBubble.hoverPolygon.length; i++) {
      ctx.lineTo(_infoBubble.hoverPolygon[i][0], _infoBubble.hoverPolygon[i][1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },

  scheduleHoverPolygonUpdate: function() {
    window.clearTimeout(_infoBubble.hoverPolygonUpdateTimerId);

    _infoBubble.hoverPolygonUpdateTimerId = window.setTimeout(function() {
      _infoBubble.updateHoverPolygon(_infoBubble.lastMouseX, _infoBubble.lastMouseY);
    }, 50);
  },

  onBodyMouseMove: function(event) {
    var mouseX = event.pageX;
    var mouseY = event.pageY;

    _infoBubble.lastMouseX = mouseX;
    _infoBubble.lastMouseY = mouseY;

    if (_infoBubble.visible) {
      if (!_infoBubble._withinHoverPolygon(mouseX, mouseY)) {
        _infoBubble.show(false);
      }
    }

    _infoBubble.scheduleHoverPolygonUpdate();
  },

  hideSegment: function(fast) {
    if (_infoBubble.segmentEl) {
      _infoBubble.segmentEl.classList.remove('hover');
      var el = _infoBubble.segmentEl;
      if (fast) {
        el.classList.add('immediate-show-drag-handles');
        window.setTimeout(function() {
          el.classList.remove('immediate-show-drag-handles');
        }, 0);
      } else {
        el.classList.remove('immediate-show-drag-handles');
      }
      _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown');
      _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-inside-info-bubble');
      _infoBubble.segmentEl.classList.remove('show-drag-handles');
      _infoBubble.segmentEl = null;
    }
  },

  hide: function() {
    _infoBubble.mouseInside = false;

    if (_infoBubble.descriptionVisible) {
      _infoBubble.descriptionVisible = false;
      _infoBubble.el.classList.remove('show-description');
      if (_infoBubble.segmentEl) {
        _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown');
      }
    }

    if (_infoBubble.el) {
      document.body.classList.remove('controls-fade-out');

      _infoBubble.el.classList.remove('visible');
      _infoBubble.visible = false;

      document.body.removeEventListener('mousemove', _infoBubble.onBodyMouseMove);
    }
  },

  considerShowing: function(event, segmentEl, type) {
    if (menuVisible || readOnly) {
      return;
    }

    if (event) {
      _infoBubble.considerMouseX = event.pageX;
      _infoBubble.considerMouseY = event.pageY;
    } else {
      var pos = _getElAbsolutePos(segmentEl);

      _infoBubble.considerMouseX = pos[0] - document.querySelector('#street-section-outer').scrollLeft;
      _infoBubble.considerMouseY = pos[1];
    }
    _infoBubble.considerSegmentEl = segmentEl;
    _infoBubble.considerType = type;

    if ((segmentEl == _infoBubble.segmentEl) && (type == _infoBubble.type)) {
      return;
    }

    if (!_infoBubble.visible || !_infoBubble._withinHoverPolygon(_infoBubble.considerMouseX, _infoBubble.considerMouseY)) {
      _infoBubble.show(false);
    }
  },

  dontConsiderShowing: function() {
    _infoBubble.considerSegmentEl = null;
    _infoBubble.considerType = null;
  },

  onBuildingVariantButtonClick: function(event, left, variantChoice) {
    if (left) {
      street.leftBuildingVariant = variantChoice;

      var el = document.querySelector('#street-section-left-building');
      el.id = 'street-section-left-building-old';

      var newEl = document.createElement('div');
      newEl.id = 'street-section-left-building';
    } else {
      street.rightBuildingVariant = variantChoice;

      var el = document.querySelector('#street-section-right-building');
      el.id = 'street-section-right-building-old';

      var newEl = document.createElement('div');
      newEl.id = 'street-section-right-building';
    }

    el.parentNode.appendChild(newEl);
    _updateBuildingPosition();
    _switchSegmentElIn(newEl);
    _switchSegmentElAway(el);

    // TODO repeat
    $(newEl).mouseenter(_onBuildingMouseEnter);
    $(newEl).mouseleave(_onBuildingMouseLeave);

    _saveStreetToServerIfNecessary();
    _createBuildings();

    _infoBubble.updateContents();
  },

  getBubbleDimensions: function() {
    _infoBubble.bubbleWidth = _infoBubble.el.offsetWidth;

    if (_infoBubble.descriptionVisible) {
      var el = _infoBubble.el.querySelector('.description-canvas');
      var pos = _getElAbsolutePos(el);
      _infoBubble.bubbleHeight = pos[1] + el.offsetHeight - 38;
    } else {
      _infoBubble.bubbleHeight = _infoBubble.el.offsetHeight;
    }

    var height = _infoBubble.bubbleHeight + 30;

    _infoBubble.el.style.webkitTransformOrigin = '50% ' + height + 'px';
    _infoBubble.el.style.MozTransformOrigin = '50% ' + height + 'px';
    _infoBubble.el.style.transformOrigin = '50% ' + height + 'px';
  },

  updateDescriptionInContents: function(segment) {
    if (!_infoBubble.segmentEl || !segment || !segment.el ||
        (_infoBubble.segmentEl != segment.el)) {
      return;
    }

    var segmentInfo = SEGMENT_INFO[segment.type];
    var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString];

    _removeElFromDom(_infoBubble.el.querySelector('.description-prompt'));
    _removeElFromDom(_infoBubble.el.querySelector('.description-canvas'));

    var description = '';
    if (variantInfo && variantInfo.description) {
      var description = variantInfo.description;
    } else if (segmentInfo && segmentInfo.description) {
      var description = segmentInfo.description;
    }

    if (description) {
      var el = document.createElement('div');
      el.classList.add('description-prompt');
      el.innerHTML = (description.prompt) ? description.prompt : 'Learn more';
      if (system.touch) {
        el.addEventListener('touchstart', _infoBubble.showDescription);
      } else {
        el.addEventListener('click', _infoBubble.showDescription);
      }
      $(el).mouseenter(_infoBubble.highlightTriangle);
      $(el).mouseleave(_infoBubble.unhighlightTriangle);
      _infoBubble.el.appendChild(el);

      var el = document.createElement('div');
      el.classList.add('description-canvas');

      var innerEl = document.createElement('div');
      innerEl.classList.add('description');
      if (description.image) {
        innerEl.innerHTML += '<img src="/images/info-bubble-examples/' + description.image + '">';
      }
      if (description.lede) {
        innerEl.innerHTML += '<p class="lede">' + description.lede + '</p>';
      }
      for (var i = 0; i < description.text.length; i++) {
        innerEl.innerHTML += '<p>' + description.text[i] + '</p>';
      }
      if (description.imageCaption) {
        innerEl.innerHTML += '<footer>Photo: ' + description.imageCaption + '</footer>';
      }
      el.appendChild(innerEl);

      var els = innerEl.querySelectorAll('a');
      for (var i = 0, anchorEl; anchorEl = els[i]; i++) {
        anchorEl.target = '_blank';
      }

      var innerEl = document.createElement('div');
      innerEl.classList.add('description-close');
      innerEl.innerHTML = 'Close';
      if (system.touch) {
        innerEl.addEventListener('touchstart', _infoBubble.hideDescription);
      } else {
        innerEl.addEventListener('click', _infoBubble.hideDescription);
      }
      $(innerEl).mouseenter(_infoBubble.highlightTriangle);
      $(innerEl).mouseleave(_infoBubble.unhighlightTriangle);
      el.appendChild(innerEl);

      var innerEl = document.createElement('div');
      innerEl.classList.add('triangle');
      el.appendChild(innerEl);

      _infoBubble.el.appendChild(el);
    }
  },

  updateWarningsInContents: function(segment) {
    if (!_infoBubble.segmentEl || !segment || !segment.el ||
        (_infoBubble.segmentEl != segment.el)) {
      return;
    }
    var el = _infoBubble.el.querySelector('.warnings');

    var html = '';

    if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
      html += '<p>';
      html += msg('WARNING_DOESNT_FIT');
      html += '</p>';
    }
    if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL]) {
      html += '<p>';
      html += msg('WARNING_NOT_WIDE_ENOUGH');
      html += '</p>';
    }
    if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]) {
      html += '<p>';
      html += msg('WARNING_TOO_WIDE');
      html += '</p>';
    }

    if (html) {
      el.innerHTML = html;
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }

    _infoBubble.getBubbleDimensions();
  },

  updateHeightButtonsInContents: function() {
    var height = (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ? street.leftBuildingHeight : street.rightBuildingHeight;
    var variant = (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ? street.leftBuildingVariant : street.rightBuildingVariant;

    if (!_isFlooredBuilding(variant) || (height == 1)) {
      _infoBubble.el.querySelector('.non-variant .decrement').disabled = true;
    } else {
      _infoBubble.el.querySelector('.non-variant .decrement').disabled = false;
    }

    if (!_isFlooredBuilding(variant) || (height == MAX_BUILDING_HEIGHT)) {
      _infoBubble.el.querySelector('.non-variant .increment').disabled = true;
    } else {
      _infoBubble.el.querySelector('.non-variant .increment').disabled = false;
    }
  },

  updateWidthButtonsInContents: function(width) {
    if (width == MIN_SEGMENT_WIDTH) {
      _infoBubble.el.querySelector('.non-variant .decrement').disabled = true;
    } else {
      _infoBubble.el.querySelector('.non-variant .decrement').disabled = false;
    }

    if (width == MAX_SEGMENT_WIDTH) {
      _infoBubble.el.querySelector('.non-variant .increment').disabled = true;
    } else {
      _infoBubble.el.querySelector('.non-variant .increment').disabled = false;
    }
  },

  updateHeightInContents: function(left) {
    if (!_infoBubble.visible ||
        (left && (_infoBubble.type != INFO_BUBBLE_TYPE_LEFT_BUILDING)) ||
        (!left && (_infoBubble.type != INFO_BUBBLE_TYPE_RIGHT_BUILDING))) {
      return;
    }

    var height = left ? street.leftBuildingHeight : street.rightBuildingHeight;
    var variant = left ? street.leftBuildingVariant : street.rightBuildingVariant;

    _infoBubble.updateHeightButtonsInContents();

    if (_isFlooredBuilding(variant)) {
      var el = _infoBubble.el.querySelector('.non-variant .height');
      if (el) {
        el.realValue = height;
        el.value = _prettifyHeight(height, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);
      } else {
        var el = _infoBubble.el.querySelector('.non-variant .height-non-editable');
        el.innerHTML = _prettifyHeight(height, PRETTIFY_WIDTH_OUTPUT_MARKUP);
      }
    }
  },

  updateWidthInContents: function(segmentEl, width) {
    if (!_infoBubble.visible || !_infoBubble.segmentEl ||
        (_infoBubble.segmentEl != segmentEl)) {
      return;
    }

    _infoBubble.updateWidthButtonsInContents(width);

    var el = _infoBubble.el.querySelector('.non-variant .width');
    if (el) {
      el.realValue = width;
      el.value = _prettifyWidth(width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);
    } else {
      var el = _infoBubble.el.querySelector('.non-variant .width-non-editable');
      el.innerHTML = _prettifyWidth(width, PRETTIFY_WIDTH_OUTPUT_MARKUP);
    }
  },

  createVariantIcon: function(name, buttonEl) {
    var variantIcon = VARIANT_ICONS[name];

    if (variantIcon) {
      var canvasEl = document.createElement('canvas');
      canvasEl.width = VARIANT_ICON_SIZE * system.hiDpi;
      canvasEl.height = VARIANT_ICON_SIZE * system.hiDpi;
      canvasEl.style.width = VARIANT_ICON_SIZE + 'px';
      canvasEl.style.height = VARIANT_ICON_SIZE + 'px';

      var ctx = canvasEl.getContext('2d');
      _drawSegmentImage(3, ctx, (VARIANT_ICON_START_X + variantIcon.x * 3) * TILE_SIZE, (VARIANT_ICON_START_Y + variantIcon.y * 3) * TILE_SIZE, 24, 24, 0, 0, VARIANT_ICON_SIZE, VARIANT_ICON_SIZE);
      buttonEl.appendChild(canvasEl);

      if (variantIcon.title) {
        buttonEl.title = variantIcon.title;
      }
    }
  },

  updateContents: function() {
    var infoBubbleEl = _infoBubble.el;

    switch (_infoBubble.type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        var segment = street.segments[parseInt(_infoBubble.segmentEl.dataNo)];
        var segmentInfo = SEGMENT_INFO[segment.type];
        var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString];
        var name = variantInfo.name || segmentInfo.name;

        //var name = segmentInfo.name;
        var canBeDeleted = true;
        var showWidth = true;
        var showVariants = true;

        _infoBubble.el.setAttribute('type', 'segment');
        break;
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
        var name = BUILDING_VARIANT_NAMES[BUILDING_VARIANTS.indexOf(street.leftBuildingVariant)];
        var canBeDeleted = false;
        var showWidth = false;
        var showVariants = false;

        _infoBubble.el.setAttribute('type', 'building');
        break;
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        var name = BUILDING_VARIANT_NAMES[BUILDING_VARIANTS.indexOf(street.rightBuildingVariant)];
        var canBeDeleted = false;
        var showWidth = false;
        var showVariants = false;

        _infoBubble.el.setAttribute('type', 'building');
        break;
    }

    infoBubbleEl.innerHTML = '';

    var triangleEl = document.createElement('div');
    triangleEl.classList.add('triangle');
    infoBubbleEl.appendChild(triangleEl);

    // Header

    var headerEl = document.createElement('header');

    headerEl.innerHTML = name;

    if (canBeDeleted) {
      var innerEl = document.createElement('button');
      innerEl.classList.add('remove');
      innerEl.innerHTML = 'Remove';
      //_infoBubble.createVariantIcon('trashcan', innerEl);
      innerEl.segmentEl = _infoBubble.segmentEl;
      innerEl.tabIndex = -1;
      innerEl.setAttribute('title', msg('TOOLTIP_REMOVE_SEGMENT'));
      if (system.touch) {
        innerEl.addEventListener('touchstart', _onRemoveButtonClick);
      } else {
        innerEl.addEventListener('click', _onRemoveButtonClick);
      }
      headerEl.appendChild(innerEl);
    }

    infoBubbleEl.appendChild(headerEl);

    // Building height canvas

    if ((_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ||
        (_infoBubble.type == INFO_BUBBLE_TYPE_RIGHT_BUILDING)) {
      if (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) {
        var variant = street.leftBuildingVariant;
        var height = street.leftBuildingHeight;
      } else {
        var variant = street.rightBuildingVariant;
        var height = street.rightBuildingHeight;
      }

      var disabled = !_isFlooredBuilding(variant);

      var widthCanvasEl = document.createElement('div');
      widthCanvasEl.classList.add('non-variant');
      widthCanvasEl.classList.add('building-height');

      var innerEl = document.createElement('button');
      innerEl.classList.add('increment');
      innerEl.innerHTML = '+';
      innerEl.tabIndex = -1;
      innerEl.title = msg('TOOLTIP_ADD_FLOOR');
      var func = function() {
        _changeBuildingHeight(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING, true);
      }
      if (system.touch) {
        innerEl.addEventListener('touchstart', func);
      } else {
        innerEl.addEventListener('click', func);
      }
      widthCanvasEl.appendChild(innerEl);
      if (!system.touch) {
        var innerEl = document.createElement('input');
        innerEl.setAttribute('type', 'text');
        innerEl.classList.add('height');
        innerEl.title = msg('TOOLTIP_BUILDING_HEIGHT');

        innerEl.addEventListener('click', _onWidthHeightEditClick);
        innerEl.addEventListener('focus', _onHeightEditFocus);
        innerEl.addEventListener('blur', _onHeightEditBlur);
        innerEl.addEventListener('input', _onHeightEditInput);
        innerEl.addEventListener('mouseover', _onWidthHeightEditMouseOver);
        innerEl.addEventListener('mouseout', _onWidthHeightEditMouseOut);
        innerEl.addEventListener('keydown', _onHeightEditKeyDown);

        //innerEl.addEventListener('mouseover', _showWidthChart);
        //innerEl.addEventListener('mouseout', _hideWidthChart);
      } else {
        var innerEl = document.createElement('span');
        innerEl.classList.add('height-non-editable');
      }
      if (disabled) {
        innerEl.disabled = true;
      }
      widthCanvasEl.appendChild(innerEl);

      var innerEl = document.createElement('button');
      innerEl.classList.add('decrement');
      innerEl.innerHTML = '–';
      innerEl.tabIndex = -1;
      innerEl.title = msg('TOOLTIP_REMOVE_FLOOR');
      var func = function() {
        _changeBuildingHeight(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING, false);
      }
      if (system.touch) {
        innerEl.addEventListener('touchstart', func);
      } else {
        innerEl.addEventListener('click', func);
      }
      widthCanvasEl.appendChild(innerEl);

      infoBubbleEl.appendChild(widthCanvasEl);
    }

    // Width canvas

    if (showWidth) {
      var widthCanvasEl = document.createElement('div');
      widthCanvasEl.classList.add('non-variant');

      if (!segmentInfo.variants[0]) {
        widthCanvasEl.classList.add('entire-info-bubble');
      }

      var innerEl = document.createElement('button');
      innerEl.classList.add('decrement');
      innerEl.innerHTML = '–';
      innerEl.segmentEl = segment.el;
      innerEl.title = msg('TOOLTIP_DECREASE_WIDTH');
      innerEl.tabIndex = -1;
      if (system.touch) {
        innerEl.addEventListener('touchstart', _onWidthDecrementClick);
      } else {
        innerEl.addEventListener('click', _onWidthDecrementClick);
      }
      innerEl.addEventListener('mouseover', _showWidthChart);
      innerEl.addEventListener('mouseout', _hideWidthChart);
      widthCanvasEl.appendChild(innerEl);

      if (!system.touch) {
        var innerEl = document.createElement('input');
        innerEl.setAttribute('type', 'text');
        innerEl.classList.add('width');
        innerEl.title = msg('TOOLTIP_SEGMENT_WIDTH');
        innerEl.segmentEl = segment.el;

        innerEl.addEventListener('click', _onWidthHeightEditClick);
        innerEl.addEventListener('focus', _onWidthEditFocus);
        innerEl.addEventListener('blur', _onWidthEditBlur);
        innerEl.addEventListener('input', _onWidthEditInput);
        innerEl.addEventListener('mouseover', _onWidthHeightEditMouseOver);
        innerEl.addEventListener('mouseout', _onWidthHeightEditMouseOut);
        innerEl.addEventListener('keydown', _onWidthEditKeyDown);

        //innerEl.addEventListener('mouseover', _showWidthChart);
        //innerEl.addEventListener('mouseout', _hideWidthChart);
      } else {
        var innerEl = document.createElement('span');
        innerEl.classList.add('width-non-editable');
      }
      widthCanvasEl.appendChild(innerEl);


      var innerEl = document.createElement('button');
      innerEl.classList.add('increment');
      innerEl.innerHTML = '+';
      innerEl.segmentEl = segment.el;
      innerEl.tabIndex = -1;
      innerEl.title = msg('TOOLTIP_INCREASE_WIDTH');
      if (system.touch) {
        innerEl.addEventListener('touchstart', _onWidthIncrementClick);
      } else {
        innerEl.addEventListener('click', _onWidthIncrementClick);
      }
      innerEl.addEventListener('mouseover', _showWidthChart);
      innerEl.addEventListener('mouseout', _hideWidthChart);
      widthCanvasEl.appendChild(innerEl);

      infoBubbleEl.appendChild(widthCanvasEl);
    }

    // Variants

    var variantsEl = document.createElement('div');
    variantsEl.classList.add('variants');

    switch (_infoBubble.type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        var first = true;

        for (var i in segmentInfo.variants) {
          if (!first) {
            var el = document.createElement('hr');
            variantsEl.appendChild(el);
          } else {
            first = false;
          }

          for (var j in VARIANTS[segmentInfo.variants[i]]) {
            var variantName = segmentInfo.variants[i];
            var variantChoice = VARIANTS[segmentInfo.variants[i]][j];

            var el = document.createElement('button');
            _infoBubble.createVariantIcon(variantName + VARIANT_SEPARATOR + variantChoice, el);

            if (segment.variant[variantName] == variantChoice) {
              el.disabled = true;
            }

            if (system.touch) {
              el.addEventListener('touchstart', (function(dataNo, variantName, variantChoice) {
                return function() {
                  _changeSegmentVariant(dataNo, variantName, variantChoice);
                }
              })(segment.el.dataNo, variantName, variantChoice));
            } else {
              el.addEventListener('click', (function(dataNo, variantName, variantChoice) {
                return function() {
                  _changeSegmentVariant(dataNo, variantName, variantChoice);
                }
              })(segment.el.dataNo, variantName, variantChoice));
            }

            variantsEl.appendChild(el);
          }
        }
        break;
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        if (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) {
          var variant = street.leftBuildingVariant;
        } else {
          var variant = street.rightBuildingVariant;
        }

        for (var j in BUILDING_VARIANTS) {
          var el = document.createElement('button');
          // TODO const
          _infoBubble.createVariantIcon('building' + VARIANT_SEPARATOR + BUILDING_VARIANTS[j], el);
          if (BUILDING_VARIANTS[j] == variant) {
            el.disabled = true;
          }

          variantsEl.appendChild(el);

          if (system.touch) {
            el.addEventListener('touchstart', (function(left, variantChoice) {
              return function() {
                _infoBubble.onBuildingVariantButtonClick(null, left, variantChoice);
              }
            })(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING, BUILDING_VARIANTS[j]));
          } else {
            el.addEventListener('click', (function(left, variantChoice) {
              return function() {
                _infoBubble.onBuildingVariantButtonClick(null, left, variantChoice);
              }
            })(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING, BUILDING_VARIANTS[j]));
          }
        }

        break;
    }

    infoBubbleEl.appendChild(variantsEl);

    // Warnings

    var el = document.createElement('div');
    el.classList.add('warnings');

    infoBubbleEl.appendChild(el);

    _infoBubble.updateDescriptionInContents(segment);
    _infoBubble.updateWarningsInContents(segment);
    window.setTimeout(function() {
      if (_infoBubble.type == INFO_BUBBLE_TYPE_SEGMENT) {
        _infoBubble.updateWidthInContents(segment.el, segment.width);
      } else {
        _infoBubble.updateHeightInContents(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING);
      }
    }, 0);
  },

  highlightTriangle: function() {
    _infoBubble.el.classList.add('highlight-triangle');
  },

  unhighlightTriangle: function() {
    _infoBubble.el.classList.remove('highlight-triangle');
  },

  unhighlightTriangleDelayed: function() {
    window.setTimeout(function() { _infoBubble.unhighlightTriangle(); }, 200);
  },

  showDescription: function() {
    _infoBubble.descriptionVisible = true;

    var el = _infoBubble.el.querySelector('.description-canvas');
    el.style.height = (streetSectionTop + 200 + 50 - _infoBubble.bubbleY) + 'px';

    _infoBubble.el.classList.add('show-description');
    if (_infoBubble.segmentEl) {
      _infoBubble.segmentEl.classList.add('hide-drag-handles-when-description-shown');
    }
    _infoBubble.unhighlightTriangleDelayed();
    window.setTimeout(function() {
      _infoBubble.getBubbleDimensions();
      _infoBubble.updateHoverPolygon();
    }, 500);

    var segment = street.segments[parseInt(_infoBubble.segmentEl.dataNo)];
    _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_LEARN_MORE,
        segment.type, null, false);
  },

  hideDescription: function() {
    _infoBubble.descriptionVisible = false;
    _infoBubble.el.classList.remove('show-description');
    if (_infoBubble.segmentEl) {
      _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown');
    }

    _infoBubble.getBubbleDimensions();
    _infoBubble.unhighlightTriangleDelayed();
    _infoBubble.updateHoverPolygon();
  },

  // TODO rename
  show: function(force) {
    if (_infoBubble.suppressed) {
      window.setTimeout(_infoBubble.show, 100);
      return;
    }

    if (draggingType != DRAGGING_TYPE_NONE) {
      return;
    }

    if (!_infoBubble.considerType) {
      _infoBubble.hide();
      _infoBubble.hideSegment(false);
      return;
    }

    var segmentEl = _infoBubble.considerSegmentEl;
    var type = _infoBubble.considerType;

    if ((segmentEl == _infoBubble.segmentEl) &&
        (type == _infoBubble.type) && !force) {
      return;
    }
    _infoBubble.hideSegment(true);

    var mouseX = _infoBubble.considerMouseX;
    var mouseY = _infoBubble.considerMouseY;

    _infoBubble.segmentEl = segmentEl;
    _infoBubble.type = type;

    if (segmentEl) {
      segmentEl.classList.add('hover');
      segmentEl.classList.add('show-drag-handles');
    }
    if (_infoBubble.visible) {
      segmentEl.classList.add('immediate-show-drag-handles');

      if (_infoBubble.descriptionVisible) {
        _infoBubble.descriptionVisible = false;
        _infoBubble.el.classList.remove('show-description');
        if (_infoBubble.segmentEl) {
          _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown');
        }
      }
    }

    _infoBubble.startMouseX = mouseX;
    _infoBubble.startMouseY = mouseY;

    var pos = _getElAbsolutePos(segmentEl);
    var bubbleX = pos[0] - document.querySelector('#street-section-outer').scrollLeft;
    var bubbleY = pos[1];

    _infoBubble.el = document.querySelector('#main-screen .info-bubble');
    _infoBubble.updateContents();

    var bubbleWidth = _infoBubble.el.offsetWidth;
    var bubbleHeight = _infoBubble.el.offsetHeight;

    // TODO const
    bubbleY -= bubbleHeight - 20;
    if (bubbleY < 50) {
      bubbleY = 50;
    }

    bubbleX += segmentEl.offsetWidth / 2;
    bubbleX -= bubbleWidth / 2;

    // TODO const
    if (bubbleX < 50) {
      bubbleX = 50;
    } else if (bubbleX > system.viewportWidth - bubbleWidth - 50) {
      bubbleX = system.viewportWidth - bubbleWidth - 50;
    }

    _infoBubble.el.style.left = bubbleX + 'px';
    _infoBubble.el.style.top = bubbleY + 'px';

    if (!_infoBubble.visible) {
      _infoBubble.visible = true;

    }
    _infoBubble.el.classList.add('visible');

    _infoBubble.bubbleX = bubbleX;
    _infoBubble.bubbleY = bubbleY;
    _infoBubble.bubbleWidth = bubbleWidth;
    _infoBubble.bubbleHeight = bubbleHeight;

    _infoBubble.updateHoverPolygon(mouseX, mouseY);
    document.body.addEventListener('mousemove', _infoBubble.onBodyMouseMove);
  }
};

var _statusMessage = {
  timerId: -1,

  show: function(text, undo) {
    window.clearTimeout(_statusMessage.timerId);

    document.querySelector('#status-message > div').innerHTML = text;

    if (undo) {
      var buttonEl = document.createElement('button');
      buttonEl.innerHTML = msg('BUTTON_UNDO');
      buttonEl.addEventListener('click', _undo);
      document.querySelector('#status-message > div').appendChild(buttonEl);
    }

    var el = document.createElement('button');
    el.classList.add('close');
    if (system.touch) {
      el.addEventListener('touchstart', _statusMessage.hide);
    } else {
      el.addEventListener('click', _statusMessage.hide);
    }
    el.innerHTML = msg('UI_GLYPH_X');
    document.querySelector('#status-message > div').appendChild(el);

    document.querySelector('#status-message').classList.add('visible');

    _statusMessage.timerId =
        window.setTimeout(_statusMessage.hide, STATUS_MESSAGE_HIDE_DELAY);
  },

  hide: function() {
    document.querySelector('#status-message').classList.remove('visible');
  }
};

function _hideLoadingScreen() {

  // NOTE:
  // This function might be called on very old browsers. Please make
  // sure not to use modern faculties.

  document.getElementById('loading').className += ' hidden';
}

function _hideMenus() {
  _loseAnyFocus();

  menuVisible = false;

  var els = document.querySelectorAll('.menu.visible');
  for (var i = 0, el; el = els[i]; i++) {
    el.classList.remove('visible');
  }
}


function _onHelpMenuClick() {
  var el = document.querySelector('#help-menu');

  _infoBubble.hide();
  _statusMessage.hide();

  if (!el.classList.contains('visible')) {
    _hideMenus();
    menuVisible = true;

    el.classList.add('visible');
  } else {
    _hideMenus();
  }
}

function _onIdentityMenuClick() {
  var el = document.querySelector('#identity-menu');

  _infoBubble.hide();
  _statusMessage.hide();

  if (!el.classList.contains('visible')) {
    _hideMenus();
    menuVisible = true;

    var pos = _getElAbsolutePos(document.querySelector('#identity'));
    el.style.left = pos[0] + 'px';

    el.classList.add('visible');
  } else {
    _hideMenus();
  }
}

function _normalizeAllSegmentWidths() {
  for (var i in street.segments) {
    street.segments[i].width =
        _normalizeSegmentWidth(street.segments[i].width, RESIZE_TYPE_INITIAL);
  }
}

function _prepareDefaultStreet() {
  street.units = units;
  _propagateUnits();
  street.name = DEFAULT_NAME;
  street.width = _normalizeStreetWidth(DEFAULT_STREET_WIDTH);
  street.leftBuildingHeight = DEFAULT_BUILDING_HEIGHT_LEFT;
  street.rightBuildingHeight = DEFAULT_BUILDING_HEIGHT_RIGHT;
  street.leftBuildingVariant = DEFAULT_BUILDING_VARIANT_LEFT;
  street.rightBuildingVariant = DEFAULT_BUILDING_VARIANT_RIGHT;
  street.editCount = 0;
  //console.log('editCount = 0 on default street');
  if (signedIn) {
    _setStreetCreatorId(signInData.userId);
  }

  _fillDefaultSegments();

  _setUpdateTimeToNow();
}

function _prepareEmptyStreet() {
  street.units = units;
  _propagateUnits();

  street.name = DEFAULT_NAME;
  street.width = _normalizeStreetWidth(DEFAULT_STREET_WIDTH);
  street.leftBuildingHeight = DEFAULT_BUILDING_HEIGHT_EMPTY;
  street.rightBuildingHeight = DEFAULT_BUILDING_HEIGHT_EMPTY;
  street.leftBuildingVariant = DEFAULT_BUILDING_VARIANT_EMPTY;
  street.rightBuildingVariant = DEFAULT_BUILDING_VARIANT_EMPTY;
  street.editCount = 0;
  //console.log('editCount = 0 on empty street!');
  if (signedIn) {
    _setStreetCreatorId(signInData.userId);
  }

  street.segments = [];

  _setUpdateTimeToNow();
}

function _prepareSegmentInfo() {
  // TODO should not modify const

  for (var i in SEGMENT_INFO) {
    for (var j in SEGMENT_INFO[i].details) {
      var graphics = SEGMENT_INFO[i].details[j].graphics;

      if (graphics.repeat && !$.isArray(graphics.repeat)) {
        graphics.repeat = [graphics.repeat];
      }
      if (graphics.left && !$.isArray(graphics.left)) {
        graphics.left = [graphics.left];
      }
      if (graphics.right && !$.isArray(graphics.right)) {
        graphics.right = [graphics.right];
      }
      if (graphics.center && !$.isArray(graphics.center)) {
        graphics.center = [graphics.center];
      }
    }
  }
}

function _flash() {
  document.querySelector('#flash').classList.add('visible');

  window.setTimeout(function() {
    document.querySelector('#flash').classList.add('fading-out');
  }, 100);

  window.setTimeout(function() {
    document.querySelector('#flash').classList.remove('visible');
    document.querySelector('#flash').classList.remove('fading-out');
  }, 1000);
}

function _onEverythingLoaded() {
  switch (mode) {
    case MODES.NEW_STREET_COPY_LAST:
      _onNewStreetLastClick();
      break;
  }
  _showWelcome();

  _onResize();
  _resizeStreetWidth();
  _updateStreetName();
  _createPalette();
  _createDomFromData();
  _segmentsChanged();
  _updateShareMenu();
  _updateFeedbackMenu();

  initializing = false;
  ignoreStreetChanges = false;
  lastStreet = _trimStreetData(street);

  _updatePageUrl();
  _buildStreetWidthMenu();
  _addScrollButtons(document.querySelector('#palette'));
  _addScrollButtons(document.querySelector('#gallery .streets'));
  _addEventListeners();

  if (mode == MODES.USER_GALLERY) {
    _showGallery(galleryUserId, true);
  } else if (mode == MODES.GLOBAL_GALLERY) {
    _showGallery(null, true);
  } else if (mode == MODES.ABOUT) {
    _showAboutDialogBox();
  }

  if (promoteStreet) {
    _remixStreet();
  }

  window.setTimeout(_hideLoadingScreen, 0);

  if (debug.forceLiveUpdate) {
    _scheduleNextLiveUpdateCheck();
  }
}

function _drawStreetThumbnail(ctx, street, thumbnailWidth, thumbnailHeight,
                              multiplier, silhouette, bottomAligned,
                              transparentSky, segmentNamesAndWidths, streetName) {

  // Calculations

  var occupiedWidth = 0;
  for (var i in street.segments) {
    occupiedWidth += street.segments[i].width;
  }

  if (bottomAligned) {
    var offsetTop = thumbnailHeight - 180 * multiplier;
  } else {
    var offsetTop = (thumbnailHeight + 5 * TILE_SIZE * multiplier) / 2;
  }
  if (segmentNamesAndWidths) {
    offsetTop -= SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING * multiplier;
  }

  var offsetLeft = (thumbnailWidth - occupiedWidth * TILE_SIZE * multiplier) / 2;
  var buildingOffsetLeft = (thumbnailWidth - street.width * TILE_SIZE * multiplier) / 2;

  var groundLevel = offsetTop + 135 * multiplier;

  // Sky

  if (!transparentSky) {
    ctx.fillStyle = SKY_COLOUR;
    ctx.fillRect(0, 0, thumbnailWidth * system.hiDpi, (groundLevel + 20 * multiplier) * system.hiDpi);

    var y = groundLevel - 280;

    for (var i = 0; i < Math.floor(thumbnailWidth / SKY_WIDTH) + 1; i++) {
      ctx.drawImage(images['/images/sky-front.png'],
          0, 0, SKY_WIDTH * 2, 280 * 2,
          i * SKY_WIDTH * system.hiDpi, y * system.hiDpi, SKY_WIDTH * system.hiDpi, 280 * system.hiDpi);
    }

    var y = groundLevel - 280 - 120;

    for (var i = 0; i < Math.floor(thumbnailWidth / SKY_WIDTH) + 1; i++) {
      ctx.drawImage(images['/images/sky-rear.png'],
          0, 0, SKY_WIDTH * 2, 120 * 2,
          i * SKY_WIDTH * system.hiDpi, y * system.hiDpi, SKY_WIDTH * system.hiDpi, 120 * system.hiDpi);
    }
  }

  // Dirt

  ctx.fillStyle = BACKGROUND_DIRT_COLOUR;
  ctx.fillRect(0, (groundLevel + 20 * multiplier) * system.hiDpi,
    thumbnailWidth * system.hiDpi, (25 * multiplier) * system.hiDpi);

  ctx.fillRect(0, groundLevel * system.hiDpi,
               (thumbnailWidth / 2 - street.width * TILE_SIZE * multiplier / 2) * system.hiDpi,
               (20 * multiplier) * system.hiDpi);

  ctx.fillRect((thumbnailWidth / 2 + street.width * TILE_SIZE * multiplier / 2) * system.hiDpi,
               groundLevel * system.hiDpi,
               thumbnailWidth * system.hiDpi,
               (20 * multiplier) * system.hiDpi);

  // Segment names

  ctx.fillStyle = BOTTOM_BACKGROUND;
  ctx.fillRect(0, (groundLevel + 45 * multiplier) * system.hiDpi,
    thumbnailWidth * system.hiDpi, (thumbnailHeight - groundLevel - 45 * multiplier) * system.hiDpi);

  // Buildings

  var buildingWidth = buildingOffsetLeft / multiplier;

  var x = thumbnailWidth / 2 - street.width * TILE_SIZE * multiplier / 2;
  _drawBuilding(ctx, BUILDING_DESTINATION_THUMBNAIL, street, true, buildingWidth, groundLevel + 45, true, x - (buildingWidth - 25) * multiplier, 0, multiplier);

  var x = thumbnailWidth / 2 + street.width * TILE_SIZE * multiplier / 2;
  _drawBuilding(ctx, BUILDING_DESTINATION_THUMBNAIL, street, false, buildingWidth, groundLevel + 45, true, x - 25 * multiplier, 0, multiplier);

  // Segments

  var originalOffsetLeft = offsetLeft;

  // Collect z-indexes
  var zIndexes = [];
  for (var i in street.segments) {
    var segment = street.segments[i];
    var segmentInfo = SEGMENT_INFO[segment.type];

    if (zIndexes.indexOf(segmentInfo.zIndex) == -1) {
      zIndexes.push(segmentInfo.zIndex);
    }
  }

  for (var j in zIndexes) {
    var zIndex = zIndexes[j];

    offsetLeft = originalOffsetLeft;

    for (var i in street.segments) {
      var segment = street.segments[i];
      var segmentInfo = SEGMENT_INFO[segment.type];

      if (segmentInfo.zIndex == zIndex) {
        var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString];
        var dimensions = _getVariantInfoDimensions(variantInfo, segment.width * TILE_SIZE, 1);

        _drawSegmentContents(ctx, segment.type, segment.variantString,
            segment.width * TILE_SIZE * multiplier,
            offsetLeft + dimensions.left * TILE_SIZE * multiplier, offsetTop, segment.randSeed, multiplier, false);
      }

      offsetLeft += segment.width * TILE_SIZE * multiplier;
    }
  }


  // Segment names

  var offsetLeft = originalOffsetLeft;

  if (segmentNamesAndWidths) {
    ctx.save();

    // TODO const
    ctx.strokeStyle = 'black';
    ctx.lineWidth = .5;
    ctx.font = 'normal 300 26px Lato';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (var i = 0; i < street.segments.length; i++) {
      var segment = street.segments[i];

      var segmentInfo = SEGMENT_INFO[segment.type];
      var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString];
      var name = variantInfo.name || segmentInfo.name;

      var left = offsetLeft;
      var availableWidth = segment.width * TILE_SIZE * multiplier;

      if (i == 0) {
        left--;
      }

      _drawLine(ctx,
          left, (groundLevel + 45 * multiplier),
          left, (groundLevel + 125 * multiplier));

      var x = (offsetLeft + availableWidth / 2) * system.hiDpi;

      var text = _prettifyWidth(segment.width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);
      var width = ctx.measureText(text).width / 2;
      while ((width > availableWidth - 10 * multiplier) && (text.indexOf(' ') != -1)) {
        text = text.substr(0, text.lastIndexOf(' '));
        width = ctx.measureText(text).width / 2;
      }
      ctx.fillText(text, x,
        (groundLevel + 60 * multiplier) * system.hiDpi);

      var width = ctx.measureText(name).width / 2;
      if (width <= availableWidth - 10 * multiplier) {
        ctx.fillText(name, x,
          (groundLevel + 83 * multiplier) * system.hiDpi);
      }

      // grid
      /*for (var j = 1; j < Math.floor(availableWidth / TILE_SIZE); j++) {
        _drawLine(ctx,
            left + j * TILE_SIZE, (groundLevel + 45 * multiplier),
            left + j * TILE_SIZE, (groundLevel + 55 * multiplier));
      }*/

      offsetLeft += availableWidth;
    }

    var left = offsetLeft + 1;
    _drawLine(ctx,
        left, (groundLevel + 45 * multiplier),
        left, (groundLevel + 125 * multiplier));

    ctx.restore();
  }

  // Silhouette

  if (silhouette) {
    ctx.globalCompositeOperation = 'source-atop';
    // TODO const
    ctx.fillStyle = 'rgb(240, 240, 240)';
    ctx.fillRect(0, 0, thumbnailWidth * system.hiDpi, thumbnailHeight * system.hiDpi);
  }

  // Street name

  if (streetName) {
    var text = street.name;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'center';

    if (_streetNameNeedsUnicodeFont(text)) {
      var fallbackUnicodeFont = true;
      ctx.font = 'normal 400 140px sans-serif';
    } else {
      var fallbackUnicodeFont = false;
      ctx.font = 'normal 400 160px Roadgeek';
    }

    var measurement = ctx.measureText(text);

    var needToBeElided = false;
    while (measurement.width > (thumbnailWidth - 200) * system.hiDpi) {
      text = text.substr(0, text.length - 1);
      measurement = ctx.measureText(text);
      needToBeElided = true;
    }
    if (needToBeElided) {
      text += '…';
    }

    ctx.fillStyle = 'white';
    var x1 = thumbnailWidth * system.hiDpi / 2 - (measurement.width / 2 + 75 * system.hiDpi);
    var x2 = thumbnailWidth * system.hiDpi / 2 + (measurement.width / 2 + 75 * system.hiDpi);
    var y1 = (75 - 60) * system.hiDpi;
    var y2 = (75 + 60) * system.hiDpi;
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 10;
    ctx.strokeRect(x1 + 10 * 2, y1 + 10 * 2, x2 - x1 - 10 * 4, y2 - y1 - 10 * 4);

    var x = thumbnailWidth * system.hiDpi / 2;

    if (fallbackUnicodeFont) {
      var baselineCorrection = 24;
    } else {
      var baselineCorrection = 27;
    }

    var y = (75 + baselineCorrection) * system.hiDpi;

    ctx.strokeStyle = 'transparent';
    ctx.fillStyle = 'black';
    ctx.fillText(text, x, y);
  }
}

function _onBodyLoad() {
  bodyLoaded = true;

  document.querySelector('#loading-progress').value++;
  _checkIfEverythingIsLoaded();
}

function _onReadyStateChange() {
  if (document.readyState == 'complete') {
    readyStateCompleteLoaded = true;

    document.querySelector('#loading-progress').value++;
    _checkIfEverythingIsLoaded();
  }
}

function _processUrl() {
  var url = location.pathname;

  // Remove heading slash
  if (!url) {
    url = '/';
  }
  url = url.substr(1);

  // Remove trailing slashes
  url = url.replace(/\/+$/, '');

  var urlParts = url.split(/\//);

  if (!url) {
    // Continue where we left off… or start with a default (demo) street

    mode = MODES.CONTINUE;
  } else if ((urlParts.length == 1) && (urlParts[0] == URL_NEW_STREET)) {
    // New street

    mode = MODES.NEW_STREET;
  } else if ((urlParts.length == 1) && (urlParts[0] == URL_NEW_STREET_COPY_LAST)) {
    // New street (but start with copying last street)

    mode = MODES.NEW_STREET_COPY_LAST;
  } else if ((urlParts.length == 1) && (urlParts[0] == URL_JUST_SIGNED_IN)) {
    // Coming back from a successful sign in

    mode = MODES.JUST_SIGNED_IN;
  } else if ((urlParts.length >= 1) && (urlParts[0] == URL_ERROR)) {
    // Error

    mode = MODES.ERROR;
    errorUrl = urlParts[1];
  } else if ((urlParts.length == 1) && (urlParts[0] == URL_GLOBAL_GALLERY)) {
    // Global gallery

    mode = MODES.GLOBAL_GALLERY;
  } else if ((urlParts.length == 1) && urlParts[0]) {
    // User gallery

    galleryUserId = urlParts[0];

    mode = MODES.USER_GALLERY;
  } else if ((urlParts.length == 2) && (urlParts[0] == URL_HELP) && (urlParts[1] == URL_ABOUT)) {
    // About

    mode = MODES.ABOUT;
  } else if ((urlParts.length == 2) && (urlParts[0] == URL_NO_USER) && urlParts[1]) {
    // TODO add is integer urlParts[1];
    // Existing street by an anonymous person

    street.creatorId = null;
    street.namespacedId = urlParts[1];

    mode = MODES.EXISTING_STREET;
  } else if ((urlParts.length >= 2) && urlParts[0] && urlParts[1]) {
    // TODO add is integer urlParts[1];
    // Existing street by a signed in person

    street.creatorId = urlParts[0];

    if (street.creatorId.charAt(0) == URL_RESERVED_PREFIX) {
      street.creatorId = street.creatorId.substr(1);
    }

    street.namespacedId = urlParts[1];

    mode = MODES.EXISTING_STREET;
  } else {
    mode = MODES.NOT_FOUND;
  }
}

function _goReload() {
  location.reload();
}

function _goHome() {
  location.href = '/';
}

function _goNewStreet(sameWindow) {
  if (sameWindow) {
    location.replace('/' + URL_NEW_STREET);
  } else {
    location.href = '/' + URL_NEW_STREET;
  }
}

function _goExampleStreet() {
  location.href = '/' + URL_EXAMPLE_STREET;
}

function _goCopyLastStreet() {
  location.href = '/' + URL_NEW_STREET_COPY_LAST;
}

function _processMode() {
  serverContacted = true;

  switch (mode) {
    case MODES.ERROR:
      _showErrorFromUrl();
      break;
    case MODES.UNSUPPORTED_BROWSER:
      _showError(ERRORS.UNSUPPORTED_BROWSER, true);
      break;
    case MODES.NOT_FOUND:
      _showError(ERRORS.NOT_FOUND, true);
      break;
    case MODES.STREET_404:
      _showError(ERRORS.STREET_404, true);
      break;
    case MODES.STREET_404_BUT_LINK_TO_USER:
      _showError(ERRORS.STREET_404_BUT_LINK_TO_USER, true);
      break;
    case MODES.STREET_410_BUT_LINK_TO_USER:
      _showError(ERRORS.STREET_410_BUT_LINK_TO_USER, true);
      break;
    case MODES.SIGN_OUT:
      _showError(ERRORS.SIGN_OUT, true);
      break;
    case MODES.FORCE_RELOAD_SIGN_OUT:
      _showError(ERRORS.FORCE_RELOAD_SIGN_OUT, true);
      break;
    case MODES.FORCE_RELOAD_SIGN_OUT_401:
      _showError(ERRORS.FORCE_RELOAD_SIGN_OUT_401, true);
      break;
    case MODES.FORCE_RELOAD_SIGN_IN:
      _showError(ERRORS.FORCE_RELOAD_SIGN_IN, true);
      break;
    case MODES.NEW_STREET:
      serverContacted = false;
      break;
    case MODES.NEW_STREET_COPY_LAST:
      serverContacted = false;
      break;
    case MODES.CONTINUE:
    case MODES.USER_GALLERY:
    case MODES.ABOUT:
    case MODES.GLOBAL_GALLERY:
      serverContacted = false;
      break;
    case MODES.JUST_SIGNED_IN:
      serverContacted = false;
      break;
    case MODES.EXISTING_STREET:
      serverContacted = false;
      break;
  }
}

function _fillEmptySegment(el) {
  var innerEl = document.createElement('span');
  innerEl.classList.add('name');
  innerEl.innerHTML = msg('SEGMENT_NAME_EMPTY');
  el.appendChild(innerEl);

  var innerEl = document.createElement('span');
  innerEl.classList.add('width');
  el.appendChild(innerEl);

  var innerEl = document.createElement('span');
  innerEl.classList.add('grid');
  el.appendChild(innerEl);
}

function _fillEmptySegments() {
  _fillEmptySegment(document.querySelector('#street-section-left-empty-space'));
  _fillEmptySegment(document.querySelector('#street-section-right-empty-space'));
}

function _fillDom() {
  // TODO Instead of doing like this, put variables in the index.html, and fill
  // them out?
  $('#undo').text(msg('BUTTON_UNDO'));
  $('#redo').text(msg('BUTTON_REDO'));

  $('#trashcan').text(msg('DRAG_HERE_TO_REMOVE'));

  $('#gallery .loading').text(msg('LOADING'));
  $('#loading > div > span').text(msg('LOADING'));

  $('#new-street').text(msg('BUTTON_NEW_STREET'));
  $('#copy-last-street').text(msg('BUTTON_COPY_LAST_STREET'));

  $('#street-width-read').attr('title', msg('TOOLTIP_STREET_WIDTH'));

  document.querySelector('#new-street').href = URL_NEW_STREET;
  document.querySelector('#copy-last-street').href = URL_NEW_STREET_COPY_LAST;

  _fillEmptySegments();
}

app.preInit = function() {
  initializing = true;
  ignoreStreetChanges = true;

  _detectDebugUrl();
  _detectSystemCapabilities();
}

app.init = function() {
  if (!debug.forceUnsupportedBrowser) {

    // TODO temporary ban
    if ((navigator.userAgent.indexOf('Opera') != -1) ||
        (navigator.userAgent.indexOf('Internet Explorer') != -1) ||
        (navigator.userAgent.indexOf('MSIE') != -1)) {
      mode = MODES.UNSUPPORTED_BROWSER;
      _processMode();
      return;
    }
  }

  _fillDom();
  _prepareSegmentInfo();

  // Temporary as per https://github.com/Modernizr/Modernizr/issues/788#issuecomment-12513563
  Modernizr.addTest('pagevisibility', !!Modernizr.prefixed('hidden', document, false));

  // TODO make it better
  // Related to Enter to 404 bug in Chrome
  $.ajaxSetup({ cache: false });

  readyStateCompleteLoaded = false;
  document.addEventListener('readystatechange', _onReadyStateChange);

  bodyLoaded = false;
  window.addEventListener('load', _onBodyLoad);

  _addBodyClasses();
  _processUrl();
  _processMode();

  if (abortEverything) {
    return;
  }

  // Asynchronously loading…

  // …detecting country from IP for units and left/right-hand driving
  if ((mode == MODES.NEW_STREET) || (mode == MODES.NEW_STREET_COPY_LAST)) {
    _detectGeolocation();
  } else {
    geolocationLoaded = true;
  }

  // …sign in info from our API (if not previously cached) – and subsequent
  // street data if necessary (depending on the mode)
  _loadSignIn();

  // …images
  _loadImages();

  // Note that we are waiting for sign in and image info to show the page,
  // but we give up on country info if it’s more than 1000ms.
}
