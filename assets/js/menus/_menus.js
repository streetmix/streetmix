
var Stmx = (function (Stmx) {

  // Ensure module path exists
  Stmx.ui = Stmx.ui || {};

  // 'private' properties
  var _isVisible = false;

  // 'public' methods
  function hide() {
    _loseAnyFocus();

    // TODO: Change reference from global variable to object
    setVisibility(false);

    var els = document.querySelectorAll('.menu.visible');
    for (var i = 0, el; el = els[i]; i++) {
      el.classList.remove('visible');
    }
  }

  function getVisibility() {
    return _isVisible;
  }

  function setVisibility(bool) {
    _isVisible = bool;
  }

  // Expose 'public' methods
  Stmx.ui.menus = {
    getVisibility: getVisibility,
    setVisibility: setVisibility,
    hide: hide
  }

  return Stmx;

}(Stmx || {}));

Stmx.ui.Menu = function(name, opts) {
  // Private
  var menus          = Stmx.ui.menus;

  opts = opts || {};
  var alignment      = opts.alignment      || 'left', // Set to 'right' if menu should be aligned to right of window
      trackActionMsg = opts.trackActionMsg || null,
      onShowCallback = opts.onShowCallback || null;   // Function to execute after menu open

  function onClick() {
    var el = document.querySelector('#' + name + '-menu');

    if (!el.classList.contains('visible')) {
      _show(el);
    } else {
      _hide();
    }
  };

  function _show(el) {
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
    menus.setVisibility(true);

    // Tracking behavior
    if (trackActionMsg !== null) {
      _eventTracking.track(TRACK_CATEGORY_INTERACTION, trackActionMsg, null, null, false);
    }

    // Callback
    if (typeof onShowCallback === 'function') {
      onShowCallback();
    }
  };

  function _hide() {
    menus.hide();
  };

  // Public
  return {
    name: name,
    onClick: onClick
  };
};
