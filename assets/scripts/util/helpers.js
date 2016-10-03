import Tweenable from 'shifty'

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

/**
 * Converts a street name to a readable and URL-friendly slug name
 *
 * @param {string} slug
 * @returns {string}
 */
export function normalizeSlug (slug) {
  slug = slug.toLowerCase()
  slug = slug.replace(/ /g, '-')
  slug = slug.replace(/-{2,}/, '-')
  slug = slug.replace(/[^a-zA-Z0-9\-]/g, '')
  slug = slug.replace(/^[-]+|[-]+$/g, '')

  return slug
}

/**
 * Tweens the given numeric properties on an element over time.
 *
 * @param {Element} el
 * @param {Object<string, number>} props
 * @param {number} duration
 */
export function animate (el, props, duration) {
  const initialProps = {}

  Object.keys(props).forEach(function (prop) {
    initialProps[prop] = el[prop] || 0
  })

  if (el.tweenable) {
    el.tweenable.stop()
  }

  el.tweenable = new Tweenable()
  el.tweenable.tween({
    from: initialProps,
    to: props,
    duration: duration,
    step: (state) => Object.assign(el, state)
  })
}
