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
import { onStreetWidthChange, onStreetWidthClick } from '../streets/width'
import { onStorageChange } from '../users/settings'
import { onGlobalKeyDown } from './keyboard_commands'
import { onResize } from './window_resize'

export function addEventListeners () {
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

  if (!app.readOnly) {
    document.querySelector('#street-width-read').addEventListener('pointerdown', onStreetWidthClick)
    document.querySelector('#street-width').addEventListener('change', onStreetWidthChange)
  }

  window.addEventListener('resize', onResize)

  // This listener hides the info bubble when the mouse leaves the
  // document area. Do not normalize it to a pointerleave event
  // because it doesn't make sense for other pointer types
  document.addEventListener('mouseleave', onBodyMouseOut)

  window.addEventListener('pointerdown', onBodyMouseDown)
  window.addEventListener('pointermove', onBodyMouseMove)
  window.addEventListener('pointerup', onBodyMouseUp)
  window.addEventListener('keydown', onGlobalKeyDown)
}
