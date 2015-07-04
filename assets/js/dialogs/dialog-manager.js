/*
 *  DialogManager (singleton)
 *
 *  Handles general dialog state
 *
 */

var DialogManager = (function () {
  'use strict'

  var dialogs = {}

  function init () {
    // Should be called after DOM is ready
    // Set up event listeners for dialog shield
    if (system.touch) {
      document.querySelector('#dialog-box-shield').addEventListener('touchstart', this.hideAll)
    } else {
      document.querySelector('#dialog-box-shield').addEventListener('click', this.hideAll)
    }

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

  return {
    init: init,
    define: define,
    isVisible: isVisible,
    hideAll: hideAll,
    dialogs: dialogs
  }

})()
