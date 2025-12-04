import { z } from 'zod'

import { makeStreetImage } from './image.js'

import type { Street } from '@streetmix/types'

const DEFAULT_IMAGE_SCALE = 1.0 // previous default is 2.0
const MIN_IMAGE_SCALE = 0.5
const MAX_IMAGE_SCALE = 5.0

// Use fewer valid stringbool values; may want to define elsewhere
const stringbools = {
  truthy: ['true', '1'],
  falsy: ['false', '0'],
}

// Zod preprocess function that converts empty string inputs in query
// parameters to `undefined` so that it can be given default values.
const emptyStringToUndefined = (val: string) => (val === '' ? undefined : val)

// Shorthand function for parsing query params
// Converts string bools to booleans
// Converts empty strings to undefined
// Applies default boolean value to undefined values
const parseQueryParam = (defaultValue: boolean) =>
  z.preprocess(
    emptyStringToUndefined,
    z.stringbool(stringbools).default(defaultValue)
  )

export const StreetImageExportSchema = z.object({
  locale: z.preprocess(emptyStringToUndefined, z.string().default('en')),
  transparentSky: parseQueryParam(false),
  labels: parseQueryParam(true), // formerly 'segmentLabels'
  streetName: parseQueryParam(true),
  watermark: parseQueryParam(true),
  scale: z.preprocess(
    emptyStringToUndefined,
    z.coerce
      .number()
      .min(MIN_IMAGE_SCALE)
      .max(MAX_IMAGE_SCALE)
      .default(DEFAULT_IMAGE_SCALE)
  ), // formerly `dpi`
})

export type StreetImageExportOptions = z.infer<typeof StreetImageExportSchema>

export async function runTestCanvas(
  street: Street,
  options: StreetImageExportOptions
): Promise<Buffer> {
  console.log('making image with options', options)

  const image = await makeStreetImage(street, options)

  return image
}
