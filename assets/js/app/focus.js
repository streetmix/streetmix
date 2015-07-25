var ignoreWindowFocus = false

/**
 *  Refocusing on the body immediately after some other element is
 *  removed from the page allows the application to continue to receive
 *  keydown events. (Otherwise the browser could capture those events
 *  and do browser default actions instead.)
 *  However, _loseAnyFocus() is very aggressive, because if it is called at
 *  the wrong time, it could cause the user to lose focus on something
 *  (like an input box) improperly, so be very careful when using it.
 */
function _loseAnyFocus () {
  document.body.focus()
}

function _isFocusOnBody () {
  return document.activeElement == document.body
}

// Because Firefox is stupid and their prompt() dialog boxes are not quite
// modal.
function _ignoreWindowFocusMomentarily () {
  ignoreWindowFocus = true
  window.setTimeout(function () {
    ignoreWindowFocus = false
  }, 50)
}

function _onWindowFocus () {
  if (abortEverything || ignoreWindowFocus) {
    return
  }

  if (!galleryVisible) {
    _fetchStreetForVerification()

    // Save settings on window focus, so the last edited street is the one you’re
    // currently looking at (in case you’re looking at many streets in various
    // tabs)
    _saveSettingsLocally()
  }
}

function _onWindowBlur () {
  if (abortEverything) {
    return
  }

  MenuManager.hideAll()
}

function _onVisibilityChange () {
  if (document[system.visibilityState] === 'hidden') {
    _onWindowBlur()
  } else {
    _onWindowFocus()
  }
}
