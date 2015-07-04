/*
 *  Menu (class)
 *
 *  Generic class instance of menu
 *
 */

var Menu = (function () {
  /* global Menu, _infoBubble, _statusMessage, _getElAbsolutePos, _loseAnyFocus */
  /* var MenuManager = require('menu-manager') */
  'use strict'

  var Menu = function (name, opts) {
    opts = opts || {}
    this.name = name
    this.alignment = opts.alignment || 'left' // Set to 'right' if menu should be aligned to right of window
    this.onShowCallback = opts.onShow || null // Function to execute after menu open
    this.el = null // Placeholder
  }

  Menu.prototype.init = function () {
    var menuButton = '#' + this.name + '-menu-button'
    var menuButtonEl = document.querySelector(menuButton)

    // Save a reference to its DOM element
    this.el = document.querySelector('#' + this.name + '-menu')

    if (menuButtonEl) {
      // Firefox sometimes disables some buttons… unsure why
      menuButtonEl.disabled = false

      // Bind event listeners to the menu button
      menuButtonEl.addEventListener('click', this.onClick.bind(this))
    }
  }

  Menu.prototype.onClick = function () {
    if (!this.el.classList.contains('visible')) {
      this.show()
    } else {
      this.hide()
    }
  }

  Menu.prototype.show = function () {
    // Hide other UI
    _infoBubble.hide()
    _statusMessage.hide()
    MenuManager.hideAll()

    // Determine positioning
    if (this.alignment === 'right') {
      // Note: this aligns to right edge of menu bar,
      // instead of the right side of the menu item.
      this.el.classList.add('align-right')
    } else {
      // Aligns menu to the left side of the menu item.
      var pos = _getElAbsolutePos(document.querySelector('#' + this.name + '-menu-item'))
      this.el.style.left = pos[0] + 'px'
    }

    // Show menu
    this.el.classList.add('visible')

    // Callback
    if (typeof this.onShowCallback === 'function') {
      this.onShowCallback()
    }
  }

  Menu.prototype.hide = function () {
    _loseAnyFocus()
    this.el.classList.remove('visible')
  }

  return Menu

}())
