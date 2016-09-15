import _ from 'lodash'
import { infoBubble } from '../info_bubble/info_bubble'
import { app } from '../preinit/app_settings'
import {
  onBuildingMouseEnter,
  onBuildingMouseLeave
} from '../segments/buildings'
import {
  onBodyMouseOut,
  onBodyMouseDown,
  onBodyMouseMove,
  onBodyMouseUp
} from '../segments/drag_and_drop'
import {
  onNewStreetDefaultClick,
  onNewStreetEmptyClick,
  onNewStreetLastClick
} from '../streets/creation'
import { undo, redo } from '../streets/undo_stack'
import { onStreetWidthChange, onStreetWidthClick } from '../streets/width'
import { onStorageChange } from '../users/settings'
import { onGlobalKeyDown } from './keyboard_commands'
import { onResize } from './window_resize'
import { system } from '../preinit/system_capabilities'
import { onVisibilityChange, onWindowFocus } from './focus'
import { registerKeypress } from './keypress'
import { msg } from './messages'
import { showStatusMessage, hideStatusMessage } from './status_message'
import { showDebugInfo } from './debug_info'
import Print from './print'
import { addScrollButtons, updateScrollButtons } from '../gallery/scroll'
import { updateGalleryShield, repeatReceiveGalleryData, onGalleryShieldClick } from '../gallery/view'
import { attachNonBlockingAjaxListeners } from '../util/fetch_nonblocking'
import { attachNameResizeListener, askForStreetName } from '../streets/name'
import { updateStreetScrollIndicators, attachStreetScrollListeners, scrollStreet } from '../streets/scroll'
import BlockingShield from './blocking_shield'

export function addEventListeners () {
  BlockingShield.attachListeners()
  Print.attachEventListeners()

  document.querySelector('#gallery-try-again').addEventListener('pointerdown', repeatReceiveGalleryData)
  document.querySelector('#gallery-shield').addEventListener('pointerdown', onGalleryShieldClick)

  window.addEventListener('stmx:everything_loaded', function () {
    if (system.pageVisibility) {
      document.addEventListener(system.visibilityChange, onVisibilityChange, false)
    } else {
      window.addEventListener('focus', onWindowFocus)
    }

    addScrollButtons(document.querySelector('#palette'))
    addScrollButtons(document.querySelector('#gallery .streets'))

    attachNonBlockingAjaxListeners()
    updateGalleryShield()
    attachNameResizeListener()

    attachStreetScrollListeners()
  })

  // Add prompt event to main street name
  if (!app.readOnly) {
    document.getElementById('street-name').addEventListener('pointerdown', askForStreetName)
  }

  // As per issue #306.
  window.addEventListener('stmx:save_street', hideStatusMessage)

  document.querySelector('#street-section-left-building').addEventListener('pointerenter', onBuildingMouseEnter)
  document.querySelector('#street-section-left-building').addEventListener('pointerleave', onBuildingMouseLeave)
  document.querySelector('#street-section-right-building').addEventListener('pointerenter', onBuildingMouseEnter)
  document.querySelector('#street-section-right-building').addEventListener('pointerleave', onBuildingMouseLeave)

  document.querySelector('.info-bubble').addEventListener('pointerenter', infoBubble.onMouseEnter)
  document.querySelector('.info-bubble').addEventListener('pointerleave', infoBubble.onMouseLeave)
  document.querySelector('.info-bubble').addEventListener('pointerdown', infoBubble.onTouchStart)

  // The following do not seem to work on pointerdown
  // click should also be fired by other input methods
  document.querySelector('#new-street-default').addEventListener('click', onNewStreetDefaultClick)
  document.querySelector('#new-street-empty').addEventListener('click', onNewStreetEmptyClick)
  document.querySelector('#new-street-last').addEventListener('click', onNewStreetLastClick)

  window.addEventListener('storage', onStorageChange)

  document.querySelector('#undo').addEventListener('pointerdown', undo)
  document.querySelector('#redo').addEventListener('pointerdown', redo)

  if (!app.readOnly) {
    document.querySelector('#street-width-read').addEventListener('pointerdown', onStreetWidthClick)
    document.querySelector('#street-width').addEventListener('change', onStreetWidthChange)
  }

  window.addEventListener('resize', onResize)
  window.addEventListener('resize', function () {
    updateScrollButtons()
    updateStreetScrollIndicators()
  })

  // This listener hides the info bubble when the mouse leaves the
  // document area. Do not normalize it to a pointerleave event
  // because it doesn't make sense for other pointer types
  document.addEventListener('mouseleave', onBodyMouseOut)

  window.addEventListener('pointerdown', onBodyMouseDown)
  window.addEventListener('pointermove', onBodyMouseMove)
  window.addEventListener('pointerup', onBodyMouseUp)
  window.addEventListener('keydown', onGlobalKeyDown)

  registerKeyPressListeners()
}

function registerKeyPressListeners () {
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
  }, _.noop)

  // Catch-all for the backspace or delete buttons to prevent
  // browsers from going back in history
  registerKeypress(['backspace', 'delete'], {
    preventDefault: true,
    requireFocusOnBody: true
  }, _.noop)

  // Register keyboard input for show (shift-D)
  registerKeypress('shift d', showDebugInfo)

  // Register keyboard shortcuts to hide info bubble
  // Only hide if it's currently visible, and if the
  // description is NOT visible. (If the description
  // is visible, the escape key should hide that first.)
  registerKeypress('esc', {
    condition: function () { return infoBubble.visible && !infoBubble.descriptionVisible }
  }, function () {
    infoBubble.hide()
    infoBubble.hideSegment(false)
  })

  registerKeypress('left', function (event) {
    scrollStreet(true, event.shiftKey)
  })
  registerKeypress('right', function (event) {
    scrollStreet(false, event.shiftKey)
  })
}

