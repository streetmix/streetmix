/*
 *  MenuManager (singleton)
 *
 *  Handles general menu state
 */

var MenuManager = (function () {
  /* global Menu, _loseAnyFocus */
  'use strict'

  var menus = {}

  // Initialize all defined Menus
  // Should be called after DOM is ready
  function init () {
    for (var i in menus) {
      menus[i].init()
    }
  }

  // Set up a Menu that the app knows about
  function define (name, opts) {
    menus[name] = new Menu(name, opts)

    return menus[name]
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

  return {
    init: init,
    define: define,
    isVisible: isVisible,
    hideAll: hideAll,
    menus: menus
  }

})()
