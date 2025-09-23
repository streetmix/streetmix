import { onWindowFocus } from './focus'

export function onVisibilityChange (): void {
  if (document.visibilityState !== 'hidden') {
    onWindowFocus()
  }
}
