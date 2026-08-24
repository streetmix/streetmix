import { onWindowFocus } from './focus.js'

export function onVisibilityChange(): void {
  if (document.visibilityState !== 'hidden') {
    onWindowFocus()
  }
}
