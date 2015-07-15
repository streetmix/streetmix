/**
 *  DialogManager (singleton)
 *
 *  Handles general dialog state
 *
 */
/* eslint-disable no-unused-vars */ // ignore exported DialogManager */
var DialogManager = (function () {
  /* eslint-enable no-unused-vars */
  /* global system, Dialog */
  'use strict'

  var dialogs = {}
  var _shieldEl

  function init () {
    // Should be called after DOM is ready

    // Set up shield
    _shieldEl = document.querySelector('#dialog-box-shield')
    _shieldEl.addEventListener('pointerdown', this.hideAll)

    // Init all Dialogs
    for (var i in dialogs) {
      dialogs[i].init()
    }
  }

  function define (name, selector, opts) {
    dialogs[name] = new Dialog(selector, opts)

    return dialogs[name]
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
    _shieldEl.classList.add('visible')
  }

  function hideShield () {
    _shieldEl.classList.remove('visible')
  }

  return {
    init: init,
    define: define,
    isVisible: isVisible,
    hideAll: hideAll,
    dialogs: dialogs,
    showShield: showShield,
    hideShield: hideShield
  }

})()
