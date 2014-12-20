/*
 *  Stmx.ui.dialogs
 *
 */

var Stmx = (function (Stmx) {
  'use strict';

  var dialogs = {};

  // Dialog class
  var Dialog = function (id, opts) {
    var opts = opts || {};

    this.id             = id; // Element id

    this.clickSelector  = opts.clickSelector || null;
    this.trackCategory  = opts.trackCategory || null;
    this.trackAction    = opts.trackAction   || null;
    this.onShowCallback = opts.onShow        || null; // Function to execute after dialog open
    this.onHideCallback = opts.onHide        || null; // Function to execute after dialog close
  }

  Dialog.prototype.init = function() {
    if (this.clickSelector) {
      document.querySelector(this.clickSelector).addEventListener('click', this.show.bind(this));
    }
  }

  Dialog.prototype.show = function (event) {
    // TODO: This was only on the about dialog box show function originally.
    // Is this generalizable?
    if (event && (event.shiftKey || event.ctrlKey || event.metaKey)) {
      return;
    }

    // Event management
    if (event) {
      event.preventDefault();
    }

    // Hide other UI
    Stmx.ui.menus.hideAll();

    // Show the dialog & shield
    var el = document.querySelector(this.id);
    el.classList.add('visible');
    document.querySelector('#dialog-box-shield').classList.add('visible');

    // Attach event listener for close button
    // Done here so that we can more easily bind 'this'
    // to the correct scope, also, cleans out the code
    // in event_listeners.js
    el.querySelector('.close').addEventListener('click', this.hide.bind(this));

    // Tracking behavior
    if (this.trackActionMsg !== null && this.trackCategory !== null) {
      _eventTracking.track(this.trackCategory, this.trackAction, null, null, false);
    }

    // Callback
    if (typeof this.onShowCallback === 'function') {
      this.onShowCallback();
    }
  }

  Dialog.prototype.hide = function () {
    document.querySelector(this.id).classList.remove('visible');
    document.querySelector('#dialog-box-shield').classList.remove('visible');

    // Callback
    if (typeof this.onHideCallback === 'function') {
      this.onHideCallback();
    }
  }

  // Public
  Stmx.ui.dialogs = {
    instances: dialogs,

    init: function() {
      // Set up event listeners for dialog shield
      if (system.touch) {
        document.querySelector('#dialog-box-shield').addEventListener('touchstart', this.hideAll);
      } else {
        document.querySelector('#dialog-box-shield').addEventListener('click', this.hideAll);
      }

      // Init all Dialogs
      for (var i in dialogs) {
        dialogs[i].init()
      }
    },

    setup: function (name, selector, opts) {
      dialogs[name] = new Dialog(selector, opts);
    },

    isVisible: function() {
      var hasVisibleClass = false;
      for (var i in dialogs) {
        if (document.querySelector(dialogs[i].id).classList.contains('visible')) {
          hasVisibleClass = true;
          continue;
        }
      }
      return hasVisibleClass;
    },

    hideAll: function() {
      for (var i in dialogs) {
        dialogs[i].hide()
      }
    }
  }

  return Stmx;

}(Stmx));
