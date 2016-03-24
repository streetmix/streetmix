/**
 * Gets the absolute position in pixels of a given element,
 * taking into account its CSS transformed position.
 *
 * @param {Node} element
 * @returns {Array} [x, y] where x is number of pixels from the
 *    left side of the viewport and y is the number of pixels
 *    from the top of the viewport.
 */
export function getElAbsolutePos (el) {
  let pos = [0, 0]

  do {
    pos[0] += el.offsetLeft + (el.cssTransformLeft || 0)
    pos[1] += el.offsetTop + (el.cssTransformTop || 0)

    el = el.offsetParent
  } while (el)

  return pos
}
