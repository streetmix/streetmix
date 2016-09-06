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

/**
 * Return the first matched element by provided selector, traversing from
 * current element to document. Native implementation of jQuery's `$.closest()`.
 * Taken from https://github.com/oneuijs/You-Dont-Need-jQuery
 */
export function closestEl (el, selector) {
  const matchesSelector = el.matches ||
    el.webkitMatchesSelector ||
    el.mozMatchesSelector ||
    el.msMatchesSelector

  while (el) {
    if (matchesSelector.call(el, selector)) {
      return el
    } else {
      el = el.parentElement
    }
  }
  return null
}
