/**
 *  Dialog (class)
 *
 *  Generic class instance of menu
 *
 */
/* eslint-disable no-unused-vars */ // ignore exported Dialog */
var Dialog = (function () {
  /* eslint-enable no-unused-vars */
  /* global MenuManager, Helpers, DialogManager */
  'use strict'

  var Dialog = function (id, opts) {
    opts = opts || {}

    this.id = id // Element id

    this.clickSelector = opts.clickSelector || null // Reference to element that activates this dialog when clicked
    this.onInitCallback = opts.onInit || Helpers.noop // Function to execute after dialog init
    this.onShowCallback = opts.onShow || Helpers.noop // Function to execute after dialog open
    this.onHideCallback = opts.onHide || Helpers.noop // Function to execute after dialog close

    this.el = null // For caching a reference to the dialog box's DOM element
  }

  Dialog.prototype.init = function () {
    this.el = document.querySelector(this.id)

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
    MenuManager.hideAll()

    // Show the dialog & shield
    this.el.classList.add('visible')
    DialogManager.showShield()

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
    DialogManager.hideShield()
    this.onHideCallback()
  }

  return Dialog

})()
