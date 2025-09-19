import {
  onBodyMouseDown,
  onBodyMouseMove,
  onBodyMouseUp
} from '../segments/drag_and_drop'
import { onStorageChange } from '../users/authentication'
import { onGlobalKeyDown } from './keyboard_commands'
import {
  onWindowBeforeUnload,
  onNoConnection,
  onVisibilityChange,
  onWindowFocus
} from './event_handlers'

export function addEventListeners (): void {
  window.addEventListener('storage', onStorageChange)

  window.addEventListener('pointerdown', onBodyMouseDown)
  window.addEventListener('pointermove', onBodyMouseMove)
  window.addEventListener('pointerup', onBodyMouseUp)
  window.addEventListener('keydown', onGlobalKeyDown)

  window.addEventListener('beforeunload', onWindowBeforeUnload)

  window.addEventListener('offline', onNoConnection)
  window.addEventListener('stmx:api_max_connection', onNoConnection)

  // Add event listeners to handle when a window is switched away from view,
  // then returns to view again. If the Page Visibility API exists, we use this.
  // If the Page Visibility API does not exist (or is vendor-prefixed in much
  // older browsers), use the much-less-precise `focus` event.
  if (typeof document.hidden !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibilityChange, false)
  } else {
    window.addEventListener('focus', onWindowFocus)
  }
}
