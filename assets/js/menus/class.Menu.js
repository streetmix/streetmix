/*
 *  Stmx.ui.Menu
 *
 */

var Stmx = (function (Stmx) {
  'use strict';

  // Ensure module path exists
  Stmx.ui = Stmx.ui || {};

  var Menu = function(name, opts) {
    var opts = opts || {};

    this.name           = name;
    this.alignment      = opts.alignment      || 'left', // Set to 'right' if menu should be aligned to right of window
    this.trackActionMsg = opts.trackActionMsg || null,
    this.onShowCallback = opts.onShowCallback || null;   // Function to execute after menu open
    this.el             = null; // Placeholder
  }

  Menu.prototype.onClick = function() {
    // On click, save a reference to its DOM element
    this.el = document.querySelector('#' + this.name + '-menu');

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
    Stmx.ui.menus.hide();

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
    Stmx.ui.menus.setVisibility(true);

    // Tracking behavior
    if (this.trackActionMsg !== null) {
      _eventTracking.track(TRACK_CATEGORY_INTERACTION, this.trackActionMsg, null, null, false);
    }

    // Callback
    if (typeof this.onShowCallback === 'function') {
      this.onShowCallback();
    }
  }

  Menu.prototype.hide = function() {
    _loseAnyFocus();
    Stmx.ui.menus.setVisibility(false);
    this.el.classList.remove('visible');
  }

  // Public
  Stmx.ui.Menu = Menu;

  return Stmx;

}(Stmx || {}));
