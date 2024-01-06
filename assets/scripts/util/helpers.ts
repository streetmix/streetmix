import { tween } from 'shifty'
import slugify from 'slugify'

/**
 * Gets the relative position in pixels of a given element,
 * taking into account its CSS transformed position, relative to
 * its parent component
 *
 * @param {Node} element
 * @returns {Array} [x, y] where x is number of pixels from the
 *    left side of the viewport and y is the number of pixels
 *    from the top of the viewport.
 */
export function getElRelativePos (el: HTMLElement): [number, number] {
  // In addition to the DOM's left and top offset properties, we also
  // account for CSS transforms, via the `matrix` object
  const style = window.getComputedStyle(el)
  const matrix = new DOMMatrixReadOnly(style.transform)

  return [el.offsetLeft + matrix.m41, el.offsetTop + matrix.m42]
}

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
export function getElAbsolutePos (
  el: HTMLElement,
  includeScroll = false
): [number, number] {
  const pos: [number, number] = [0, 0]

  do {
    const [x, y] = getElRelativePos(el)

    pos[0] += x
    pos[1] += y

    const parent = el.offsetParent

    if (includeScroll && parent) {
      pos[0] -= parent.scrollLeft
      pos[1] -= parent.scrollTop
    }

    el = parent as HTMLElement
  } while (el !== null)

  return pos
}

/**
 * Converts a street name to a readable and URL-friendly slug name
 */
export function normalizeSlug (slug?: string | null): string | undefined {
  if (slug === null || typeof slug === 'undefined') return

  // Remove certain replacements mapped by slugify
  slugify.extend({
    '|': '',
    '%': '',
    $: ''
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
 */
export function animate (
  el: HTMLElement,
  props: Record<string, number>,
  duration: number
): void {
  const initialProps: Record<string, number> = Object.keys(props).reduce(
    (acc: Record<string, number>, prop) => {
      if (typeof el[prop] !== 'undefined') {
        acc[prop] = el[prop]
      } else {
        acc[prop] = 0
      }
      return acc
    },
    {}
  )

  void tween({
    from: initialProps,
    to: props,
    duration,
    render: (state) => Object.assign(el, state)
  })
}

export function isExternalUrl (url: string): boolean {
  // Based on is-url-external
  // @see: https://github.com/mrded/is-url-external
  const { hostname } = window.location

  const urlHostname = (function (url) {
    if (/^https?:\/\//.test(url)) {
      // Absolute URL

      // The easy way to parse an URL, is to create <a> element.
      // @see: https://gist.github.com/jlong/2428561
      const parser = document.createElement('a')
      parser.href = url

      return parser.hostname
    }

    // Relative URL
    return window.location.hostname
  })(url)

  return hostname !== urlHostname
}
