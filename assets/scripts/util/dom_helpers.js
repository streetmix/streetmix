export function emptyEl (el) {
  while (el.lastChild) {
    el.removeChild(el.lastChild)
  }
}
