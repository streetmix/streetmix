/*
 * This file is beginning as 10,494 lines of client-side Javascript.
 * Eventually it will be split and modularized into smaller pieces:
 * https://github.com/codeforamerica/streetmix/issues/226
 */

"use strict";

// Saved data
// ------------------------------------------------------------------------

var lastStreet;

var suppressMouseEnter = false;

// ------------------------------------------------------------------------

var readOnly = false;

var mouseX;
var mouseY;

// -------------------------------------------------------------------------


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

function _hideLoadingScreen() {

  // NOTE:
  // This function might be called on very old browsers. Please make
  // sure not to use modern faculties.

  document.getElementById('loading').className += ' hidden';
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
