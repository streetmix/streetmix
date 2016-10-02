import { noop } from 'lodash'

import { showGallery, hideGallery } from '../gallery/view'
import { changeBuildingHeight } from '../segments/buildings'
import {
  draggingType,
  DRAGGING_TYPE_RESIZE,
  DRAGGING_TYPE_MOVE,
  handleSegmentMoveCancel
} from '../segments/drag_and_drop'
import {
  handleSegmentResizeCancel,
  incrementSegmentWidth
} from '../segments/resizing'
import { undo, redo } from '../streets/undo_stack'
import { getSignInData, isSignedIn } from '../users/authentication'
import { trackEvent } from './event_tracking'
import { isFocusOnBody } from './focus'
import { registerKeypress } from './keypress'
import { msg } from './messages'
import { showStatusMessage } from './status_message'

export const KEYS = {
  ENTER: 13,
  ESC: 27,
  Y: 89,
  Z: 90,
  EQUAL: 187, // = or +
  EQUAL_ALT: 61, // Firefox
  PLUS_KEYPAD: 107,
  MINUS: 189,
  MINUS_ALT: 173, // Firefox
  MINUS_KEYPAD: 109
}

export function onGlobalKeyDown (event) {
  if (isFocusOnBody()) {
    onBodyKeyDown(event)
  }

  switch (event.keyCode) {
    case KEYS.ESC:
      if (draggingType() === DRAGGING_TYPE_RESIZE) {
        handleSegmentResizeCancel()
      } else if (draggingType() === DRAGGING_TYPE_MOVE) {
        handleSegmentMoveCancel()
      } else if (document.body.classList.contains('gallery-visible')) {
        hideGallery(false)
      } else if (isSignedIn()) {
        showGallery(getSignInData().userId, false)
      } else {
        return
      }

      event.preventDefault()
      break
  }
}

function onBodyKeyDown (event) {
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

      var negative = (event.keyCode === KEYS.MINUS) ||
        (event.keyCode === KEYS.MINUS_ALT) ||
        (event.keyCode === KEYS.MINUS_KEYPAD)

      var hoveredEl = getHoveredEl()
      if (hoveredEl) {
        if (hoveredEl.classList.contains('segment')) {
          incrementSegmentWidth(hoveredEl, !negative, event.shiftKey)
        } else if (hoveredEl.id === 'street-section-left-building') {
          changeBuildingHeight(true, !negative)
        } else if (hoveredEl.id === 'street-section-right-building') {
          changeBuildingHeight(false, !negative)
        }
        event.preventDefault()

        trackEvent('INTERACTION', 'CHANGE_WIDTH', 'KEYBOARD', null, true)
      }
      break
    case KEYS.Z:
      if (!event.shiftKey && (event.metaKey || event.ctrlKey)) {
        undo()
        event.preventDefault()
      } else if (event.shiftKey && (event.metaKey || event.ctrlKey)) {
        redo()
        event.preventDefault()
      }
      break
    case KEYS.Y:
      if (event.metaKey || event.ctrlKey) {
        redo()
        event.preventDefault()
      }
      break
  }
}

function getHoveredEl () {
  var el = document.querySelector('.hover')
  return el
}

export function registerKeypresses () {
  // In case anyone tries a save shortcut key out of reflex,
  // we inform the user that it's not necessary.
  registerKeypress('ctrl s', {
    trackAction: 'Command-S or Ctrl-S save shortcut key pressed'
  }, function () {
    showStatusMessage(msg('STATUS_NO_NEED_TO_SAVE'))
  })

  // Catch-all for the Ctrl-S shortcut from ever trying to
  // save the page contents
  registerKeypress('ctrl s', {
    preventDefault: true,
    requireFocusOnBody: false
  }, noop)

  // Catch-all for the backspace or delete buttons to prevent
  // browsers from going back in history
  registerKeypress(['backspace', 'delete'], {
    preventDefault: true,
    requireFocusOnBody: true
  }, noop)
}
