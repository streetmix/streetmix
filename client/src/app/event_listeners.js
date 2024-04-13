import {
  onBodyMouseDown,
  onBodyMouseMove,
  onBodyMouseUp
} from '../segments/drag_and_drop'
import { onStorageChange } from '../users/authentication'
import { onWindowBeforeUnload, onNoConnection } from '../util/fetch_nonblocking'
import { onGlobalKeyDown } from './keyboard_commands'
import { onResize } from './window_resize'
import { addPageVisibilityChangeListeners } from './focus'

export function addEventListeners () {
  window.addEventListener('storage', onStorageChange)

  window.addEventListener('resize', onResize)

  window.addEventListener('pointerdown', onBodyMouseDown)
  window.addEventListener('pointermove', onBodyMouseMove)
  window.addEventListener('pointerup', onBodyMouseUp)
  window.addEventListener('keydown', onGlobalKeyDown)

  window.addEventListener('beforeunload', onWindowBeforeUnload)

  window.addEventListener('offline', onNoConnection)
  window.addEventListener('stmx:api_max_connection', onNoConnection)

  addPageVisibilityChangeListeners()
}
