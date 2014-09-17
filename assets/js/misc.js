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

var WIDTH_CHART_WIDTH = 500;
var WIDTH_CHART_EMPTY_OWNER_WIDTH = 40;
var WIDTH_CHART_MARGIN = 20;

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

function _getVariantString(variant) {
  var string = '';
  for (var i in variant) {
    string += variant[i] + VARIANT_SEPARATOR;
  }

  string = string.substr(0, string.length - 1);
  return string;
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
