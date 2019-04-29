import { tween } from 'shifty'
import slugify from 'slugify'

/**
 * Gets the absolute position in pixels of a given element,
 * taking into account its CSS transformed position, and optionally,
 * the scroll position of parent elements
 *
 * @param {Node} element
 * @param {Boolean} includeScroll - if true, takes into account
 *    scroll position of parent elements
 * @returns {Array} [x, y] where x is number of pixels from the
 *    left side of the viewport and y is the number of pixels
 *    from the top of the viewport.
 */
export function getElAbsolutePos (el, includeScroll = false) {
  let pos = [0, 0]

  do {
    pos[0] += el.offsetLeft + (el.cssTransformLeft || 0)
    pos[1] += el.offsetTop + (el.cssTransformTop || 0)

    const parent = el.offsetParent

    if (includeScroll && parent) {
      pos[0] -= parent.scrollLeft
      pos[1] -= parent.scrollTop
    }

    el = parent
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
  if (!slug) return

  // Remove certain replacements mapped by slugify
  slugify.extend({
    '|': null,
    '%': null,
    '$': null
  })

  const slugified = slugify(slug, {
    replacement: '-',
    remove: /[*+=~.,<>(){}'"!?:;@#$%^&*|\\/[\]]/g,
    lower: true
  })

  // Remove any trailing or leading hyphens, which slugify doesn't clean up
  return slugified.replace(/^[-]+|[-]+$/g, '')
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

  tween({
    from: initialProps,
    to: props,
    duration: duration,
    step: (state) => Object.assign(el, state)
  })
}
