/**
 * dialog-manager
 *
 * Handles general dialog state
 *
 */
'use strict'

var dialogs = {}
var shieldEl

// Should be called after DOM is ready
function init () {
  // Require all dialogs
  dialogs.about = require('./_about')
  dialogs.saveAsImage = require('./_save_as_image')

  // Init shield element
  shieldEl = document.querySelector('#dialog-box-shield')
  shieldEl.addEventListener('pointerdown', this.hideAll)

  // Init all Dialogs
  for (var i in dialogs) {
    dialogs[i].init()
  }
}

function isVisible () {
  var hasVisibleClass = false
  for (var i in dialogs) {
    if (dialogs[i].el.classList.contains('visible')) {
      hasVisibleClass = true
      continue
    }
  }
  return hasVisibleClass
}

function hideAll () {
  for (var i in dialogs) {
    dialogs[i].hide()
  }
}

function showShield () {
  shieldEl.classList.add('visible')
}

function hideShield () {
  shieldEl.classList.remove('visible')
}

module.exports = {
  init: init,
  isVisible: isVisible,
  hideAll: hideAll,
  showShield: showShield,
  hideShield: hideShield,
  dialogs: dialogs
}
