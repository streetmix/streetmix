import { observeStore, type RootState } from '../store'
import { images } from '../app/load_resources'
import { DEFAULT_SKYBOX } from './constants'
import SKYBOX_DEFS from './skybox-defs.json'
import type { Unsubscribe } from '@reduxjs/toolkit'

export type CSSGradientStop = string | [string, number?] // [CSS color string, opacity]
export type CSSGradientDeclaration = CSSGradientStop[]

export interface SkyboxDefinition {
  name: string
  enabled?: boolean
  iconImage?: string // Illustration asset ID
  backgroundColor?: string // CSS color string
  backgroundImage?: string // Illustration asset ID
  backgroundGradient?: CSSGradientDeclaration
  backgroundObjects?: Array<{
    image: string // Illustration asset ID
    width: number // in pixels
    height: number // in pixels
    top: number // Percentage as decimal
    left: number // Percentage as decimal
  }>
  foregroundGradient?: CSSGradientDeclaration
  cloudOpacity?: number // Percentage as decimal
  invertUITextColor?: boolean
}

export interface SkyboxDefWithStyles extends SkyboxDefinition {
  id: string
  style: React.CSSProperties
  iconStyle: React.CSSProperties
}

/**
 * Converts information from skybox-defs.json to create a string value
 * for a linear gradient that be accepted by the CSS `background-image` property.
 */
export function makeCSSGradientDeclaration (
  array: CSSGradientDeclaration
): string {
  // Normalize all values
  const stops = array.map((item: CSSGradientStop) => {
    // If the value is an array, turn it into a string
    if (Array.isArray(item)) {
      const [color, position] = item

      // Position is recorded as a value between 0 and 1, but is optional
      let percentage
      if (position !== undefined) {
        percentage = ` ${position * 100}%`
      }

      return color + (percentage ?? '')
    }

    // Otherwise assume it's a string and return as-is
    return item
  })

  return `linear-gradient(${stops.join(', ')})`
}

/**
 * Converts information from skybox-defs.json to create a string that can
 * be accepted by the CSS `background` property.
 */
function makeCSSBackgroundImageDeclaration (url: string): string {
  const asset = images.get(url)
  if (asset === undefined) {
    throw new Error('Asset not found: ' + url)
  }

  return `url('${asset.src}') top/${asset.width}px repeat`
}

/**
 * Converts information from skybox-defs.json to create a style object
 * that can be used directly in React for elements that accept the
 * style prop, e.g. `<div style={style} />`
 */
function makeReactStyleObject (
  env: SkyboxDefinition,
  renderImages = true
): React.CSSProperties {
  const style: React.CSSProperties = {}
  const background = []

  if (env.backgroundGradient) {
    background.push(makeCSSGradientDeclaration(env.backgroundGradient))
  }

  // If `renderImages` is true, add images to the style definition.
  // Images are not good for icons where the images won't be visible
  // and special images need to be used.
  if (renderImages) {
    if (env.backgroundImage !== undefined) {
      try {
        const bg = makeCSSBackgroundImageDeclaration(env.backgroundImage)
        background.push(bg)
      } catch (err) {
        console.error(err)
      }
    }
  }

  // Background colors must occur last in the `background` list
  if (env.backgroundColor !== undefined) {
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
 */
export function makeCanvasGradientStopArray (
  array: CSSGradientDeclaration
): Array<[string, number]> {
  // If the value is a string, wrap it in an array
  const stops: Array<[string, number?]> = array.map((item) => {
    if (typeof item === 'string') {
      return [item]
    }

    // Otherwise, return the original array, but spread it
    // so that the values are cloned. We don't want later
    // transformations to modify the original values.
    return [...item]
  })

  // If the first item doesn't have a stop, make it 0
  if (stops[0][1] === undefined) {
    stops[0][1] = 0
  }

  // If the last item doesn't have a stop, make it 1
  if (stops[stops.length - 1][1] === undefined) {
    stops[stops.length - 1][1] = 1
  }

  // Now go through each color stop and fill in missing stops
  let previousStop = stops[0][1]
  for (let i = 0; i < stops.length; i++) {
    if (previousStop !== undefined) {
      const stop = stops[i][1]
      if (stop === undefined) {
        let n = i
        while (stops[n][1] === undefined) {
          n++
        }
        const steps = n - i + 1
        const nextStep = stops[n][1]
        if (nextStep !== undefined) {
          const stepSize = (nextStep - previousStop) / steps
          for (let j = i; j < n; j++) {
            previousStop = stops[j][1] = previousStop + stepSize
          }
        }
      } else {
        previousStop = stop
      }
    }
  }

  return stops as Array<[string, number]>
}

/**
 * Gets a single skybox definition with a React-ready style object.
 */
export function getSkyboxDef (id: string): SkyboxDefWithStyles {
  let env = SKYBOX_DEFS[id as keyof typeof SKYBOX_DEFS] as SkyboxDefinition

  if (env === undefined) {
    env = SKYBOX_DEFS[DEFAULT_SKYBOX]
    id = DEFAULT_SKYBOX
  }

  return {
    ...env,
    id,
    style: makeReactStyleObject(env),
    iconStyle: makeReactStyleObject(env, false)
  }
}

/**
 * Gets all skybox definitions with React-ready style objects.
 */
export function getAllSkyboxDefs (): SkyboxDefWithStyles[] {
  return Object.entries(
    SKYBOX_DEFS as unknown as Record<keyof SkyboxDefinition, SkyboxDefinition>
  )
    .filter(([_, value]) => value.enabled !== false)
    .map(([key, _]: [string, SkyboxDefinition]) => getSkyboxDef(key))
}

/**
 * Toggles the `dark-skybox-invert-ui` on the <body> element when there is a
 * dark skybox. UI elements that are placed on top of the dark background
 * should use this classname to invert its colors.
 */
export function initSkyboxChangedListener (): Unsubscribe {
  const select = (state: RootState): SkyboxDefWithStyles => ({
    ...getSkyboxDef(state.street.skybox)
  })
  const onChange = (state: SkyboxDefinition): void => {
    // `invertUITextColor` may not be defined, so coerce it to `false` with Boolean()
    document.body.classList.toggle(
      'dark-skybox-invert-ui',
      Boolean(state.invertUITextColor)
    )
  }

  return observeStore(select, onChange)
}
