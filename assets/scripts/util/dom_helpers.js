export function emptyEl (el) {
  while (el.lastChild) {
    el.removeChild(el.lastChild)
  }
}

export function removeElFromDOM (el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el)
  }
}
