
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
  // Private
  var menus          = Stmx.ui.menus;

  var trackActionMsg = opts.trackActionMsg || null,
      name           = opts.name,
      alignment      = opts.alignment      || 'left', // Set to 'right' if menu should be aligned to right of window
      onShowCallback = opts.onShowCallback || null;   // Function to execute after menu open

  var _show = function (el) {
    // Hide other UI
    _infoBubble.hide();
    _statusMessage.hide();
    menus.hide();

    // Determine positioning
    if (alignment === 'right') {
      // Note: this aligns to right edge of menu bar,
      // instead of the right side of the menu item.
      el.classList.add('align-right');
    } else {
      // Aligns menu to the left side of the menu item.
      var pos = _getElAbsolutePos(document.querySelector('#' + name + '-menu-item'));
      el.style.left = pos[0] + 'px';
    }

    // Show menu
    el.classList.add('visible');
    menus.isVisible = true;
    menuVisible = true; // TODO: Deprecate this global

    // Tracking behavior
    if (trackActionMsg !== null) {
      _eventTracking.track(TRACK_CATEGORY_INTERACTION, trackActionMsg, null, null, false);
    }

    // Callback
    if (typeof onShowCallback === 'function') {
      onShowCallback();
    }
  };

  var _hide = function () {
    menus.hide();
  };

  // Public
  return {
    onClick: function () {
      var el = document.querySelector('#' + name + '-menu');

      if (!el.classList.contains('visible')) {
        _show(el);
      } else {
        _hide();
      }
    }
  };
};

// TODO: Deprecate the following
var menuVisible = false;

function _hideMenus () {
  // Wrapper for object
  Stmx.ui.menus.hide();
}
