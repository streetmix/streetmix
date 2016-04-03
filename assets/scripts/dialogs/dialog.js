/**
 * Dialog (class)
 *
 * Generic class instance of menu
 *
 */
import _ from 'lodash'

import { hideAllMenus } from '../menus/menu'
import { showShield, hideShield } from './dialog_shield'

const DIALOGS = new Map()

export default class Dialog {
  constructor (id, opts = {}) {
    this.id = id // Element id

    this.clickSelector = opts.clickSelector || null // Reference to element that activates this dialog when clicked
    this.onInitCallback = opts.onInit || _.noop // Function to execute after dialog init
    this.onShowCallback = opts.onShow || _.noop // Function to execute after dialog open
    this.onHideCallback = opts.onHide || _.noop // Function to execute after dialog close
    this.isVisible = false

    this.el = null // For caching a reference to the dialog box's DOM element

    // Store a reference to this
    DIALOGS.set(id, this)

    this.init()
  }

  init () {
    this.el = document.querySelector(this.id)

    if (this.clickSelector) {
      document.querySelector(this.clickSelector).addEventListener('pointerdown', this.show.bind(this))
    }

    // Callback
    // Put additional event listeners in this.onInitCallback, for example
    this.onInitCallback()
  }

  show (event) {
    // TODO: This was only on the about dialog box show function originally.
    // Is this generalizable?
    if (event && (event.shiftKey || event.ctrlKey || event.metaKey)) {
      return
    }

    if (event) {
      event.preventDefault()
    }

    // Hide other UI
    hideAllMenus()

    // Show the dialog & shield
    this.el.classList.add('visible')
    this.isVisible = true
    showShield()

    // Attach event listener for close button
    // Done here so that we can more easily bind 'this'
    // to the correct scope, also, cleans out the code
    // in event_listeners.js
    this.el.querySelector('.close').addEventListener('pointerdown', this.hide.bind(this))

    // Callback
    this.onShowCallback()
  }

  hide () {
    this.el.classList.remove('visible')
    this.isVisible = false
    hideShield()
    this.onHideCallback()
  }
}

/**
 * Determine if any of the dialog boxes are currently visible,
 * checking each dialog's internal state rather than its CSS visibility.
 * Returns a boolean value.
 */
export function isAnyDialogVisible () {
  for (let [id, dialog] of DIALOGS) {
    if (dialog.isVisible === true) {
      return true
    }
  }

  return false
}

/**
 * Hides all dialogs. Calling each dialog's hide() methods allows for
 * callback functions to be called as well.
 */
export function hideAllDialogs () {
  for (let [id, dialog] of DIALOGS) {
    dialog.hide()
  }
}
