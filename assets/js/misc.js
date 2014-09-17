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

var SAVE_STREET_DELAY = 500;

var MAX_DRAG_DEGREE = 20;

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

var TRACK_LABEL_INCREMENT_BUTTON = 'Increment button';
var TRACK_LABEL_INPUT_FIELD = 'Input field';
var TRACK_LABEL_BUTTON = 'Button';

var DATE_FORMAT = 'MMM D, YYYY';

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

var streetSectionTop;

var segmentWidthResolution;
var segmentWidthClickIncrement;
var segmentWidthDraggingResolution;

var menuVisible = false;

var widthChartShowTimerId = -1;
var widthChartHideTimerId = -1;

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
