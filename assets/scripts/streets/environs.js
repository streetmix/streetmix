import ENVIRONS from './environs.json'
import { images } from '../app/load_resources'
import { DEFAULT_ENVIRONS } from './constants'
import { observeStore } from '../store'

/**
 * Converts information from environs.json to create a string value
 * for a linear gradient that be accepted by the CSS `background-image` property.
 *
 * @param {Array} array - gradients from a single env data
 * @returns {String} - CSS value
 */
export function makeCSSGradientDeclaration (array) {
  // Normalize all values
  const stops = array.map((item) => {
    // If the value is a string, use it as is
    if (typeof item === 'string') {
      return item
    }

    // If the value is an array, turn it into a string
    if (Array.isArray(item)) {
      const [color, position] = item

      // Position is recorded as a value between 0 and 1, but is optional
      let percentage
      if (position) {
        percentage = ` ${position * 100}%`
      }

      return color + (percentage || '')
    }
  })

  return `linear-gradient(${stops.join(', ')})`
}

/**
 * Converts information from environs.json to create a string that can
 * be accepted by the CSS `background` property.
 *
 * @param {String} url - path to image
 * @returns {String} - CSS value
 */
function makeCSSBackgroundImageDeclaration (url) {
  const asset = images.get(url)
  if (asset) {
    return `url('${asset.src}') top/${asset.width}px repeat`
  }
}

/**
 * Converts information from environs.json to create a style object
 * that can be used directly in React for elements that accept the
 * style prop, e.g. `<div style={style} />`
 *
 * @param {Object} - single environs data from environs.json
 * @param {Boolean} - if `true`, add images to the style definition.
 *   Images are not good for icons where the images won't be visible
 *   and special images need to be used. Default value is `true`.
 * @returns {Object} - style object that can be passed to a `style` prop
 */
function makeReactStyleObject (env, renderImages = true) {
  const style = {}

  // If an error causes `env` to be undefined, return an empty object.
  if (!env) return style

  const background = []

  if (env.backgroundGradient) {
    background.push(makeCSSGradientDeclaration(env.backgroundGradient))
  }

  if (renderImages) {
    if (env.backgroundImage) {
      background.push(makeCSSBackgroundImageDeclaration(env.backgroundImage))
    }
  }

  // Background colors must occur last in the `background` list
  if (env.backgroundColor) {
    background.push(env.backgroundColor)
  }

  style.background = background.join(', ')

  return style
}

/**
 * Converts array of gradient information into an array of [colors, stops]
 * that can be used with HTML5 canvas's gradient.addColorStop() method.
 * In CSS, defined color stops are not necessary as the browser will
 * automatically interpolate values. However, you _must_ specify stops
 * for canvas rendering. This function will also fill in any missing stop
 * values to make it easy to render to canvas.
 *
 * @param {Array} - gradient values from environs.json
 * @returns {Array} - array of [color, stops] values
 */
export function makeCanvasGradientStopArray (array) {
  // If the value is a string, wrap it in an array
  const stops = array.map((item) => {
    if (typeof item === 'string') {
      return [item]
    }

    // Otherwise, return the original array, but spread it
    // so that the values are cloned. We don't want later
    // transformations to modify the original values.
    return [...item]
  })

  // If the first item doesn't have a stop, make it 0
  if (typeof stops[0][1] === 'undefined') {
    stops[0][1] = 0
  }

  // If the last item doesn't have a stop, make it 1
  if (typeof stops[stops.length - 1][1] === 'undefined') {
    stops[stops.length - 1][1] = 1
  }

  // Now go through each color stops and fill in missing stops
  let previousStop = stops[0][1]
  for (let i = 0; i < stops.length; i++) {
    if (typeof previousStop !== 'undefined') {
      const stop = stops[i][1]
      if (typeof stop === 'undefined') {
        let n = i
        while (typeof stops[n][1] === 'undefined') {
          n++
        }
        const steps = n - i + 1
        const nextStep = stops[n][1]
        const stepSize = (nextStep - previousStop) / steps
        for (let j = i; j < n; j++) {
          previousStop = stops[j][1] = previousStop + stepSize
        }
      } else {
        previousStop = stop
      }
    }
  }

  return stops
}

/**
 * Gets a single environs with a React-ready style object.
 *
 * @returns {Object}
 */
export function getEnvirons (id) {
  let env = ENVIRONS[id]

  if (!env) {
    env = ENVIRONS[DEFAULT_ENVIRONS]
    id = DEFAULT_ENVIRONS
  }

  return {
    ...env,
    id,
    style: makeReactStyleObject(env),
    iconStyle: makeReactStyleObject(env, false)
  }
}

/**
 * Gets all environs with React-ready style objects.
 *
 * @returns {Array} - of objects
 */
export function getAllEnvirons () {
  return Object.entries(ENVIRONS)
    .filter(([key, value]) => value.enabled !== false)
    .map(([key, value]) => getEnvirons(key))
}

/**
 * Toggles the `dark-environs-invert-ui` on the <body> element when there is a dark
 * sky (environs). UI elements that are placed on top of the dark background
 * should use this classname to invert its colors.
 */
export function initEnvironsChangedListener () {
  const select = (state) => ({
    ...getEnvirons(state.street.environment)
  })
  const onChange = (state) => {
    // `invertUITextColor` may not be defined, so coerce it to `false` with Boolean()
    document.body.classList.toggle(
      'dark-environs-invert-ui',
      Boolean(state.invertUITextColor)
    )
  }

  return observeStore(select, onChange)
}
