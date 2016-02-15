/**
 * debug-info
 *
 * Displays a debugging overlay that shows the current state of the application.
 *
 * @module debug-info
 * @requires keypress
 */
/* global _clone, _loseAnyFocus */
'use strict'

var keypress = require('./keypress')

// TODO: Require utility functions from module

// Register keyboard input for show (shift-D)
function init () {
  keypress.register('shift d', show)
}

function show () {
  /* global street, undoStack, settings */
  var debugStreetData = _clone(street)
  var debugUndo = _clone(undoStack)
  var debugSettings = _clone(settings)
  var debugEl = document.querySelector('#debug')
  var textEl = debugEl.querySelector('textarea')

  // Some things just shouldn't be seen...
  for (var i in debugStreetData.segments) {
    delete debugStreetData.segments[i].el
  }

  for (var j in debugUndo) {
    for (var k in debugUndo[j].segments) {
      delete debugUndo[j].segments[k].el
    }
  }

  // Create a JSON object, this parses better in editors
  var debugObj = {
    'DATA': debugStreetData,
    'SETTINGS': debugSettings,
    'UNDO': debugUndo
  }

  debugEl.classList.add('visible')
  textEl.innerHTML = JSON.stringify(debugObj, null, 2)
  textEl.focus()
  textEl.select()

  // Prevent scrolling to bottom of textarea after select
  setTimeout(function () {
    textEl.scrollTop = 0
  }, 0)

  // Set up keypress listener to close debug window
  keypress.register('esc', hide)
  // TODO: Register mouse inputs for hide
}

function hide () {
  document.querySelector('#debug').classList.remove('visible')
  _loseAnyFocus()

  // Remove keypress listener
  keypress.deregister('esc', hide)
}

module.exports = {
  init: init,
  show: show,
  hide: hide
}
