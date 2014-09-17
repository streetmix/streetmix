/*
 * This file is beginning as 10,494 lines of client-side Javascript.
 * Eventually it will be split and modularized into smaller pieces:
 * https://github.com/codeforamerica/streetmix/issues/226
 */

"use strict";

var TWITTER_ID = '@streetmix';

var NEW_STREET_DEFAULT = 1;
var NEW_STREET_EMPTY = 2;

var WIDTH_PALETTE_MULTIPLIER = 4;

var CANVAS_HEIGHT = 480;
var CANVAS_GROUND = 35;
var CANVAS_BASELINE = CANVAS_HEIGHT - CANVAS_GROUND;

var SEGMENT_Y_NORMAL = 265;
var SEGMENT_Y_PALETTE = 20;
var PALETTE_EXTRA_SEGMENT_PADDING = 8;

var STATUS_MESSAGE_HIDE_DELAY = 15000;
var WIDTH_EDIT_INPUT_DELAY = 200;
var SHORT_DELAY = 100;

var TOUCH_CONTROLS_FADEOUT_TIME = 3000;
var TOUCH_CONTROLS_FADEOUT_DELAY = 3000;

var MAX_DRAG_DEGREE = 20;

var MIN_SEGMENT_WIDTH = 1;
var MAX_SEGMENT_WIDTH = 400;

var MAX_CANVAS_HEIGHT = 2048;

var TRACK_CATEGORY_INTERACTION = 'Interaction';
var TRACK_CATEGORY_EVENT = 'Event';
var TRACK_CATEGORY_ERROR = 'Error';

var TRACK_ACTION_LEARN_MORE = 'Learn more about segment';
var TRACK_ACTION_STREET_MODIFIED_ELSEWHERE = 'Street modified elsewhere';
var TRACK_ACTION_CHANGE_WIDTH = 'Change width';

var TRACK_LABEL_INCREMENT_BUTTON = 'Increment button';
var TRACK_LABEL_INPUT_FIELD = 'Input field';
var TRACK_LABEL_BUTTON = 'Button';

// TODO clean up/rearrange variables

// Saved data
// ------------------------------------------------------------------------

var lastStreet;

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

var menuVisible = false;

// -------------------------------------------------------------------------

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

function _getHoveredSegmentEl() {
  var el = document.querySelector('.segment.hover');
  return el;
}

function _getHoveredEl() {
  var el = document.querySelector('.hover');
  return el;
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

function _onAnotherUserIdClick(event) {
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    return;
  }

  var el = event.target;

  var userId = el.innerHTML;

  _showGallery(userId, false);

  event.preventDefault();
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
