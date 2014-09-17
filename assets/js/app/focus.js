var ignoreWindowFocus = false;

function _loseAnyFocus() {
  document.body.focus();
}

function _isFocusOnBody() {
  return document.activeElement == document.body;
}

// Because Firefox is stupid and their prompt() dialog boxes are not quite
// modal.
function _ignoreWindowFocusMomentarily() {
  ignoreWindowFocus = true;
  window.setTimeout(function() {
    ignoreWindowFocus = false;
  }, 50);
}

function _onWindowFocus() {
  if (abortEverything || ignoreWindowFocus) {
    return;
  }

  if (!galleryVisible) {
    _fetchStreetForVerification();

    // Save settings on window focus, so the last edited street is the one you’re
    // currently looking at (in case you’re looking at many streets in various
    // tabs)
    _saveSettingsLocally();
  }
}

function _onWindowBlur() {
  if (abortEverything) {
    return;
  }

  _hideMenus();
}
