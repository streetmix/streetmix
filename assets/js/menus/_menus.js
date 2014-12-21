/*
 *  Stmx.ui.menus
 *
 *  Handles general menu state and holds class instances of menu behavior
 *
 */

var Stmx = (function (Stmx) {
  'use strict';

  var menus = {};

  var Menu = function (name, opts) {
    var opts = opts || {};

    this.name           = name;

    this.alignment      = opts.alignment   || 'left'; // Set to 'right' if menu should be aligned to right of window
    this.trackAction    = opts.trackAction || null;
    this.onShowCallback = opts.onShow      || null;   // Function to execute after menu open
    this.el             = null; // Placeholder
  }

  Menu.prototype.init = function() {
    var menuButton = '#' + this.name + '-menu-button',
        menuButtonEl = document.querySelector(menuButton);

    // Save a reference to its DOM element
    this.el = document.querySelector('#' + this.name + '-menu');

    if (menuButtonEl) {
      // Firefox sometimes disables some buttons… unsure why
      menuButtonEl.disabled = false;

      // Bind event listeners to the menu button
      menuButtonEl.addEventListener('click', this.onClick.bind(this));
    }
  }

  Menu.prototype.onClick = function() {
    if (!this.el.classList.contains('visible')) {
      this.show();
    } else {
      this.hide();
    }
  }

  Menu.prototype.show = function() {
    // Hide other UI
    _infoBubble.hide();
    _statusMessage.hide();
    Stmx.ui.menus.hideAll();

    // Determine positioning
    if (this.alignment === 'right') {
      // Note: this aligns to right edge of menu bar,
      // instead of the right side of the menu item.
      this.el.classList.add('align-right');
    } else {
      // Aligns menu to the left side of the menu item.
      var pos = _getElAbsolutePos(document.querySelector('#' + this.name + '-menu-item'));
      this.el.style.left = pos[0] + 'px';
    }

    // Show menu
    this.el.classList.add('visible');

    // Tracking behavior
    if (this.trackAction !== null) {
      Stmx.app.eventTracking.track(TRACK_CATEGORY_INTERACTION, this.trackAction, null, null, false);
    }

    // Callback
    if (typeof this.onShowCallback === 'function') {
      this.onShowCallback();
    }
  }

  Menu.prototype.hide = function() {
    _loseAnyFocus();
    this.el.classList.remove('visible');
  }

  // Expose 'public' methods
  Stmx.ui.menus = {
    instances: menus,

    // Set up a Menu that the app knows about
    define: function (name, opts) {
      menus[name] = new Menu(name, opts);
    },

    // Initialize all defined Menus
    // Should be called after DOM is ready
    init: function() {
      for (var i in menus) {
        menus[i].init()
      }
    },

    isVisible: function() {
      var hasVisibleClass = false;
      for (var i in menus) {
        if (menus[i].el.classList.contains('visible')) {
          hasVisibleClass = true;
          continue;
        }
      }
      return hasVisibleClass;
    },

    hideAll: function() {
      _loseAnyFocus();

      var els = document.querySelectorAll('.menu.visible');
      for (var i = 0, el; el = els[i]; i++) {
        el.classList.remove('visible');
      }
    }
  }

  return Stmx;

}(Stmx));
