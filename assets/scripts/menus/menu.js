/*
 *  Menu (class)
 *
 *  Generic class instance of menu
 *
 */
import _ from 'lodash'

import { infoBubble } from '../info_bubble/info_bubble'
import { hideStatusMessage } from '../app/status_message'
import { registerKeypress } from '../app/keypress'
import { getElAbsolutePos } from '../util/helpers'

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
    infoBubble.hide()
    hideStatusMessage()
    hideAllMenus()

    // Determine positioning
    if (this.alignment === 'right') {
      // Note: this aligns to right edge of menu bar,
      // instead of the right side of the menu item.
      this.el.classList.add('align-right')
    } else {
      // Aligns menu to the left side of the menu item.
      const pos = getElAbsolutePos(document.querySelector(`#${this.name}-menu-item`))
      this.el.style.left = pos[0] + 'px'
    }

    // Show menu
    this.el.classList.add('visible')

    // Send event to callback
    this.onShowCallback(event)
  }

  hide () {
    document.body.focus()
    this.el.classList.remove('visible')
  }
}

/**
 * Determine if any of the menus are currently visible.
 * Returns a boolean value.
 */
export function isAnyMenuVisible () {
  const els = document.querySelectorAll('.menu.visible')
  return !(els.length === 0)
}

export function hideAllMenus () {
  const els = document.querySelectorAll('.menu.visible')

  if (els.length > 0) {
    for (let i = 0, j = els.length; i < j; i++) {
      els[i].classList.remove('visible')
    }

    // Force document.body to become the active element. Do not re-focus on
    // document.body if there were no menus to hide.
    document.body.focus()
  }
}

// Hide menus if page loses visibility.
document.addEventListener('visibilitychange', () => {
  if (document.hidden === true) {
    hideAllMenus()
  }
}, false)

// Set up keypress listener to hide menus if visible
// Wrapped in this event right now because this module is required too early
// by other modules, when the `keypress` module is not fully loaded.
window.addEventListener('stmx:everything_loaded', function () {
  registerKeypress('esc', hideAllMenus)
})

