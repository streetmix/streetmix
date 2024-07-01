import { makeStreetImage } from './image.js'

import type { Street, StreetImageOptions } from '@streetmix/types'

const DEFAULT_IMAGE_SCALE = 1.0 // previous default is 2.0
const MIN_IMAGE_SCALE = 0.5
const MAX_IMAGE_SCALE = 5.0

export async function runTestCanvas (
  street: Street,
  opts: Record<string, string> = {}
): Promise<Buffer> {
  // Make sure options are valid because they can be set via query params
  // Coerce string values to booleans
  // For values that default to `true`, set it if property is undefined.
  const transparentSky = opts.transparentSky === 'true'
  const segmentLabels =
    opts.segmentLabels === undefined ? true : opts.segmentLabels === 'true'
  const streetName =
    opts.streetName === undefined ? true : opts.streetName === 'true'
  const watermark =
    opts.watermark === undefined ? true : opts.watermark === 'true'

  // Scale must be a number and cannot be outside of bounds
  let scale = DEFAULT_IMAGE_SCALE
  const inputScale = Number(opts.scale)
  if (!Number.isNaN(inputScale)) {
    scale = Math.max(Math.min(inputScale, MAX_IMAGE_SCALE), MIN_IMAGE_SCALE)
  }

  // Locale is English unless otherwise specified
  const locale = opts.locale ?? 'en'

  const options: StreetImageOptions = {
    locale,
    transparentSky,
    segmentLabels,
    streetName,
    watermark,
    scale
  }

  console.log('making image with options', options)

  const image = await makeStreetImage(street, options)

  return image
}
