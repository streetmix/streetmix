/*
 *  menu-manager
 *
 *  Handles general menu state
 */
/* global _loseAnyFocus */
'use strict'

var menus = {}

// Initialize all defined Menus
// Should be called after DOM is ready
function init () {
  // Require all menus
  menus.feedback = require('./_feedback')
  menus.help = require('./_help')
  menus.identity = require('./_identity')
  menus.settings = require('./_settings')
  menus.share = require('./_share')

  for (var i in menus) {
    menus[i].init()
  }
}

function isVisible () {
  var hasVisibleClass = false
  for (var i in menus) {
    if (menus[i].el.classList.contains('visible')) {
      hasVisibleClass = true
      continue
    }
  }
  return hasVisibleClass
}

function hideAll () {
  var els = document.querySelectorAll('.menu.visible')
  // Do not force body focus if there is nothing to hide
  if (els.length > 0) {
    _loseAnyFocus()
  }
  for (var i = 0, j = els.length; i < j; i++) {
    els[i].classList.remove('visible')
  }
}

module.exports = {
  init: init,
  isVisible: isVisible,
  hideAll: hideAll,
  menus: menus
}
