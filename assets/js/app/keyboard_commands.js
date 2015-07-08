var TRACK_LABEL_KEYBOARD = 'Keyboard'

var KEYS = {
  LEFT_ARROW: 37,
  RIGHT_ARROW: 39,
  ENTER: 13,
  BACKSPACE: 8,
  DELETE: 46,
  ESC: 27,
  D: 68,
  S: 83,
  Y: 89,
  Z: 90,
  EQUAL: 187, // = or +
  EQUAL_ALT: 61, // Firefox
  PLUS_KEYPAD: 107,
  MINUS: 189,
  MINUS_ALT: 173, // Firefox
  MINUS_KEYPAD: 109,
  SLASH: 191 // slash or question mark
}

function _onGlobalKeyDown (event) {
  if (_isFocusOnBody()) {
    _onBodyKeyDown(event)
  }

  switch (event.keyCode) {
    case KEYS.ESC:
      if (document.querySelector('#welcome').classList.contains('visible')) {
        _hideWelcome()
      } else if (DialogManager.isVisible()) {
        DialogManager.hideAll()
      } else if (draggingType == DRAGGING_TYPE_RESIZE) {
        _handleSegmentResizeCancel()
      } else if (draggingType == DRAGGING_TYPE_MOVE) {
        _handleSegmentMoveCancel()
      } else if (MenuManager.isVisible() === true) {
        MenuManager.hideAll()
      } else if (document.querySelector('#status-message').classList.contains('visible')) {
        _statusMessage.hide()
      } else if (_infoBubble.visible && _infoBubble.descriptionVisible) {
        _infoBubble.hideDescription()
      } else if (_infoBubble.visible) {
        _infoBubble.hide()
        _infoBubble.hideSegment(false)
      } else if (document.body.classList.contains('gallery-visible')) {
        _hideGallery(false)
      } else if (signedIn) {
        _showGallery(signInData.userId, false)
      } else {
        return
      }

      event.preventDefault()
      break
  }
}

function _onBodyKeyDown (event) {
  switch (event.keyCode) {
    case KEYS.EQUAL:
    case KEYS.EQUAL_ALT:
    case KEYS.PLUS_KEYPAD:
    case KEYS.MINUS:
    case KEYS.MINUS_ALT:
    case KEYS.MINUS_KEYPAD:
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      var negative = (event.keyCode == KEYS.MINUS) ||
        (event.keyCode == KEYS.MINUS_ALT) ||
        (event.keyCode == KEYS.MINUS_KEYPAD)

      var hoveredEl = _getHoveredEl()
      if (hoveredEl) {
        if (hoveredEl.classList.contains('segment')) {
          _incrementSegmentWidth(hoveredEl, !negative, event.shiftKey)
        } else if (hoveredEl.id == 'street-section-left-building') {
          _changeBuildingHeight(true, !negative)
        } else if (hoveredEl.id == 'street-section-right-building') {
          _changeBuildingHeight(false, !negative)
        }
        event.preventDefault()

        EventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH,
          TRACK_LABEL_KEYBOARD, null, true)
      }
      break
    case KEYS.BACKSPACE:
    case KEYS.DELETE:
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      var segmentHoveredEl = _getHoveredSegmentEl()
      _removeSegment(segmentHoveredEl, event.shiftKey)

      EventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_REMOVE_SEGMENT,
        TRACK_LABEL_KEYBOARD, null, true)

      event.preventDefault()
      break
    case KEYS.LEFT_ARROW:
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }
      _scrollStreet(true, event.shiftKey)
      event.preventDefault()
      break
    case KEYS.RIGHT_ARROW:
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }
      _scrollStreet(false, event.shiftKey)
      event.preventDefault()
      break
    case KEYS.Z:
      if (!event.shiftKey && (event.metaKey || event.ctrlKey)) {
        _undo()
        event.preventDefault()
      } else if (event.shiftKey && (event.metaKey || event.ctrlKey)) {
        _redo()
        event.preventDefault()
      }
      break
    case KEYS.Y:
      if (event.metaKey || event.ctrlKey) {
        _redo()
        event.preventDefault()
      }
      break
  }
}

Keypress.register('ctrl s', {
  trackMsg: 'Command-S or Ctrl-S save shortcut key pressed'
}, function () {
  _statusMessage.show(msg('STATUS_NO_NEED_TO_SAVE'))
})

function _getHoveredSegmentEl () {
  var el = document.querySelector('.segment.hover')
  return el
}

function _getHoveredEl () {
  var el = document.querySelector('.hover')
  return el
}
