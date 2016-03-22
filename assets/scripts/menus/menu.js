/*
 *  Menu (class)
 *
 *  Generic class instance of menu
 *
 */
/* global _infoBubble, _getElAbsolutePos, _loseAnyFocus */
import _ from 'lodash'

import { hideStatusMessage } from '../app/status_message'

export default class Menu {
  constructor (name, opts = {}) {
    this.name = name
    this.alignment = opts.alignment || 'left' // Set to 'right' if menu should be aligned to right of window
    this.onInitCallback = opts.init || _.noop // Function to execute at menu init
    this.onShowCallback = opts.onShow || _.noop // Function to execute after menu open
    this.el = null // Placeholder

    this.init()
  }

  init () {
    const menuButtonEl = document.querySelector(`#${this.name}-menu-button`)

    // Save a reference to its DOM element
    this.el = document.querySelector(`#${this.name}-menu`)

    if (menuButtonEl) {
      // Firefox sometimes disables some buttons… unsure why
      menuButtonEl.disabled = false

      // Bind event listeners to the menu button
      menuButtonEl.addEventListener('pointerdown', (event) => {
        this.onClick(event)
      })
    }

    // Callback
    this.onInitCallback()
  }

  onClick (event) {
    if (!this.el.classList.contains('visible')) {
      this.show(event)
    } else {
      this.hide(event)
    }
  }

  show (event) {
    // Hide other UI
    _infoBubble.hide()
    hideStatusMessage()
    hideAllMenus()

    // Determine positioning
    if (this.alignment === 'right') {
      // Note: this aligns to right edge of menu bar,
      // instead of the right side of the menu item.
      this.el.classList.add('align-right')
    } else {
      // Aligns menu to the left side of the menu item.
      var pos = _getElAbsolutePos(document.querySelector(`#${this.name}-menu-item`))
      this.el.style.left = pos[0] + 'px'
    }

    // Show menu
    this.el.classList.add('visible')

    // Send event to callback
    this.onShowCallback(event)
  }

  hide () {
    _loseAnyFocus()
    this.el.classList.remove('visible')
  }
}

export function isAnyMenuVisible () {
  var els = document.querySelectorAll('.menu.visible')
  return !(els.length === 0)
}

export function hideAllMenus () {
  var els = document.querySelectorAll('.menu.visible')
  // Do not force body focus if there is nothing to hide
  if (els.length > 0) {
    _loseAnyFocus()
  }
  for (var i = 0, j = els.length; i < j; i++) {
    els[i].classList.remove('visible')
  }
}
