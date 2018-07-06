import {
  onBodyMouseDown,
  onBodyMouseMove,
  onBodyMouseUp
} from '../segments/drag_and_drop'
import { onStorageChange } from '../users/authentication'
import { onResize } from './window_resize'

export function addEventListeners () {
  window.addEventListener('storage', onStorageChange)
  window.addEventListener('resize', onResize)
  window.addEventListener('pointerdown', onBodyMouseDown)
  window.addEventListener('pointermove', onBodyMouseMove)
  window.addEventListener('pointerup', onBodyMouseUp)
}
