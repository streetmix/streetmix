import {
  onBuildingMouseEnter,
  onBuildingMouseLeave
} from '../segments/buildings'
import {
  onBodyMouseDown,
  onBodyMouseMove,
  onBodyMouseUp
} from '../segments/drag_and_drop'
import { onStorageChange } from '../users/authentication'
import { onGlobalKeyDown } from './keyboard_commands'
import { onResize } from './window_resize'

export function addEventListeners () {
  document.querySelector('#street-section-left-building').addEventListener('pointerenter', onBuildingMouseEnter)
  document.querySelector('#street-section-left-building').addEventListener('pointerleave', onBuildingMouseLeave)
  document.querySelector('#street-section-right-building').addEventListener('pointerenter', onBuildingMouseEnter)
  document.querySelector('#street-section-right-building').addEventListener('pointerleave', onBuildingMouseLeave)

  window.addEventListener('storage', onStorageChange)

  window.addEventListener('resize', onResize)

  window.addEventListener('pointerdown', onBodyMouseDown)
  window.addEventListener('pointermove', onBodyMouseMove)
  window.addEventListener('pointerup', onBodyMouseUp)
  window.addEventListener('keydown', onGlobalKeyDown)
}
