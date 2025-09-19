export function showBlockingShield (mode = 'load'): void {
  window.dispatchEvent(
    new window.CustomEvent('stmx:show_blocking_shield', { detail: { mode } })
  )
}

export function darkenBlockingShield (showCancel = false): void {
  window.dispatchEvent(
    new window.CustomEvent('stmx:darken_blocking_shield', {
      detail: { showCancel }
    })
  )
}

export function hideBlockingShield (): void {
  window.dispatchEvent(new window.CustomEvent('stmx:hide_blocking_shield'))
}
