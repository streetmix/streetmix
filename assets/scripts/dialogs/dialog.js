/**
 * Dialog (class)
 *
 * Generic class instance of menu
 *
 */
'use strict'

var menus = require('../menus/menu_manager')
var helpers = require('../util/helpers')

var Dialog = function (id, opts) {
  opts = opts || {}

  this.id = id // Element id

  this.clickSelector = opts.clickSelector || null // Reference to element that activates this dialog when clicked
  this.onInitCallback = opts.onInit || helpers.noop // Function to execute after dialog init
  this.onShowCallback = opts.onShow || helpers.noop // Function to execute after dialog open
  this.onHideCallback = opts.onHide || helpers.noop // Function to execute after dialog close

  this.el = null // For caching a reference to the dialog box's DOM element
}

Dialog.prototype.init = function () {
  this.el = document.querySelector(this.id)
  this.manager = require('./dialog_manager')

  if (this.clickSelector) {
    document.querySelector(this.clickSelector).addEventListener('pointerdown', this.show.bind(this))
  }

  // Callback
  // Put additional event listeners in this.onInitCallback, for example
  this.onInitCallback()
}

Dialog.prototype.show = function (event) {
  // TODO: This was only on the about dialog box show function originally.
  // Is this generalizable?
  if (event && (event.shiftKey || event.ctrlKey || event.metaKey)) {
    return
  }

  if (event) {
    event.preventDefault()
  }

  // Hide other UI
  menus.hideAll()

  // Show the dialog & shield
  this.el.classList.add('visible')
  this.manager.showShield()

  // Attach event listener for close button
  // Done here so that we can more easily bind 'this'
  // to the correct scope, also, cleans out the code
  // in event_listeners.js
  this.el.querySelector('.close').addEventListener('pointerdown', this.hide.bind(this))

  // Callback
  this.onShowCallback()
}

Dialog.prototype.hide = function () {
  this.el.classList.remove('visible')
  this.manager.hideShield()
  this.onHideCallback()
}

module.exports = Dialog
