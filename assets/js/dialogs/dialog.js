/*
 *  Dialog (class)
 *
 *  Generic class instance of menu
 *
 */

var Dialog = (function () {
  /* global MenuManager */
  'use strict'

  var Dialog = function (id, opts) {
    opts = opts || {}

    this.id = id // Element id

    this.clickSelector = opts.clickSelector || null
    this.onInitCallback = opts.onInit || null // Function to execute after dialog init
    this.onShowCallback = opts.onShow || null // Function to execute after dialog open
    this.onHideCallback = opts.onHide || null // Function to execute after dialog close

    this.el = null // For caching a reference to the dialog box's DOM element
  }

  Dialog.prototype.init = function () {
    this.el = document.querySelector(this.id)

    if (this.clickSelector) {
      document.querySelector(this.clickSelector).addEventListener('click', this.show.bind(this))
    }

    // Callback
    // Put additional event listeners in this.onInitCallback, for example
    if (typeof this.onInitCallback === 'function') {
      this.onInitCallback()
    }
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
    document.querySelector('#dialog-box-shield').classList.add('visible')

    // Attach event listener for close button
    // Done here so that we can more easily bind 'this'
    // to the correct scope, also, cleans out the code
    // in event_listeners.js
    this.el.querySelector('.close').addEventListener('click', this.hide.bind(this))

    // Callback
    if (typeof this.onShowCallback === 'function') {
      this.onShowCallback()
    }
  }

  Dialog.prototype.hide = function () {
    this.el.classList.remove('visible')
    document.querySelector('#dialog-box-shield').classList.remove('visible')

    if (typeof this.onHideCallback === 'function') {
      this.onHideCallback()
    }
  }

  return Dialog

})()
