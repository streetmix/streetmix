/*
 *  Stmx.ui.menus
 *
 *  Handles general menu state and holds class instances of menu behavior
 *
 */

var Stmx = (function (Stmx) {
  'use strict';

  // Ensure module path exists
  Stmx.ui = Stmx.ui || {};

  // 'private' properties
  var _isVisible = false;

  // 'public' methods
  function hide() {
    _loseAnyFocus();

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
