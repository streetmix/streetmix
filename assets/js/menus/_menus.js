
Stmx.ui.menus = {
  isVisible: false,

  hide: function () {
    _loseAnyFocus();

    // TODO: Change reference from global variable to object
    this.isVisible = false;
    menuVisible = false;

    var els = document.querySelectorAll('.menu.visible');
    for (var i = 0, el; el = els[i]; i++) {
      el.classList.remove('visible');
    }
  }
};

Stmx.ui.Menu = function (opts) {

  this.trackActionMsg = opts.trackActionMsg || null;
  this.name = opts.name;
  this.alignment = opts.alignment || 'left'; // Set to 'right' if menu should be aligned to right of window
  this.onShowCallback = opts.onShowCallback || null; // Function to execute after menu open

  this.onClick = function () {
    var el = document.querySelector('#' + this.name + '-menu');

    if (!el.classList.contains('visible')) {
      this._show();
    } else {
      this._hide();
    }
  };

  this._show = function () {
    var el = document.querySelector('#' + this.name + '-menu');

    // Hide other UI
    _infoBubble.hide();
    _statusMessage.hide();
    Stmx.ui.menus.hide();

    // Positioning
    if (this.alignment === 'right') {
      // Note: this aligns to right edge of menu bar,
      // instead of the right side of the menu item.
      el.classList.add('align-right');
    } else {
      var pos = _getElAbsolutePos(document.querySelector('#' + this.name + '-menu-item'));
      el.style.left = pos[0] + 'px';
    }

    // Show menu
    el.classList.add('visible');
    Stmx.ui.menus.isVisible = true;
    menuVisible = true; // TODO: Deprecate this global

    // Tracking behavior
    if (this.trackActionMsg !== null) {
      _eventTracking.track(TRACK_CATEGORY_INTERACTION, this.trackActionMsg, null, null, false);
    }

    // Callback
    if (typeof this.onShowCallback === 'function') {
      this.onShowCallback();
    }
  };

  this._hide = function () {
    Stmx.ui.menus.hide();
  };
}


// TODO: Deprecate the following
var menuVisible = false;

function _hideMenus () {
  // Wrapper for object
  Stmx.ui.menus.hide();
}
