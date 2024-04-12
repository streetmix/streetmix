export function showBlockingShield (mode = 'load') {
  window.dispatchEvent(
    new window.CustomEvent('stmx:show_blocking_shield', { detail: { mode } })
  )
}

export function darkenBlockingShield (showCancel = false) {
  window.dispatchEvent(
    new window.CustomEvent('stmx:darken_blocking_shield', {
      detail: { showCancel: !!showCancel }
    })
  )
}

export function hideBlockingShield () {
  window.dispatchEvent(new window.CustomEvent('stmx:hide_blocking_shield'))
}
