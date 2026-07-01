import { nanoid } from 'nanoid'
import clone from 'just-clone'
import { load, JSON_SCHEMA } from 'js-yaml'
import * as z from 'zod'
import { getSegmentVariantInfo } from '@streetmix/parts'
import { getWidthInMetric } from '@streetmix/utils'

import {
  normalizeSegmentWidth,
  normalizeHeightValue,
  resolutionForResizeType,
  RESIZE_TYPE_INITIAL,
} from '../segments/resizing.js'
import { getElevationValue } from '../segments/elevation.js'
import { getVariantString } from '../segments/variant_utils.js'
import { getSignInData, isSignedIn } from '../users/authentication.js'
import { SETTINGS_UNITS_IMPERIAL } from '../users/constants.js'
import { getLeftHandTraffic } from '../users/localization.js'
import { updateStreetData } from '../store/slices/street.js'
import store from '../store'
import { DEFAULT_SKYBOX } from '../sky/constants.js'
import { updateLastStreetInfo } from './xhr.js'

import type {
  MeasurementValues,
  SliceItem,
  StreetState,
  UnitsSetting,
} from '@streetmix/types'

// TODO: put together with other measurement conversion code?
const ROUGH_CONVERSION_RATE = (10 / 3) * 0.3048

// Server is now the source of truth of this value
const LATEST_SCHEMA_VERSION = 34

// Like `SlopeProperties` but different values make it easier for template
type TemplateSlopeProperties = {
  on?: boolean
  values: Array<number | MeasurementValues>
}

function processSlope(
  templateSlope: TemplateSlopeProperties | undefined,
  units: UnitsSetting
) {
  // Initialize a slope property, if not present, or if present
  // and `values` is undefined or empty
  if (
    typeof templateSlope === 'undefined' ||
    typeof templateSlope.values === 'undefined' ||
    templateSlope.values.length === 0
  ) {
    return {
      on: false,
      values: [],
    }
  }

  // If slope property is present, assume `on: true`, unless specifically
  // set to `false`
  const on = templateSlope.on === false ? false : true
  const values = []
  for (let i = 0; i < templateSlope.values.length; i++) {
    const value = templateSlope.values[i]
    if (typeof value === 'number') {
      if (units === SETTINGS_UNITS_IMPERIAL) {
        const newValue = normalizeHeightValue(
          value * ROUGH_CONVERSION_RATE,
          resolutionForResizeType(RESIZE_TYPE_INITIAL, units),
          units
        )
        values.push(newValue)
      } else {
        values.push(value)
      }
    } else {
      const newValue = getWidthInMetric(value, units)
      values.push(newValue)
    }
  }

  // Allow values to be an object specifying metric/imperial and
  // assume `on: true` if values is specified and `on` is not false
  return {
    on,
    values,
  }
}

function processTemplateSlices(
  slices: StreetTemplate['slices'],
  units: UnitsSetting
) {
  const processed: SliceItem[] = []
  const leftHandTraffic = getLeftHandTraffic()

  for (const i in slices) {
    // Original template slice, do not modify.
    const sliceTemplate = slices[i]
    // Processed slice item to be sent to new street.
    const slice = {
      ...clone(sliceTemplate),
      id: nanoid(),
      warnings: [false],
      // Initialize a slope property, if not present
      slope: processSlope(sliceTemplate.slope, units),
    } as SliceItem

    // We mirror the street slices when in left-hand traffic mode,
    // (rather than just change directionality of the lanes)
    if (leftHandTraffic) {
      for (const [key, value] of Object.entries(slice.variant)) {
        // If any variant key includes the word 'orientation', it's used to
        // align/orient something to the left or right side of the street.
        // When the street is mirrored, 'left' and 'right' must be swapped.
        if (key.includes('orientation')) {
          // Temporarily replace 'left' with a placeholder value to prevent
          // double-swapping
          const swapped = value
            .replace(/left/g, '__temp__')
            .replace(/right/g, 'left')
            .replace(/__temp__/g, 'right')

          // Replace value on variant object
          slice.variant[key] = swapped
        }
      }
    }

    // Set the variant string for legacy purposes
    slice.variantString = getVariantString(slice.variant)

    const variantInfo = getSegmentVariantInfo(slice.type, slice.variantString)

    // If width is defined as a MeasurementValues:
    //  - for metric units, use the metric value as-is
    //  - for US customary units, convert the value to metric
    // If width is defined as a number:
    //  - for metric units, use the value as-is
    //  - for US customary units, convert the value using the _rough_ conversion
    //    rate, e.g. 2.7m => 9ft, then converted back to precise metric units
    //    for storage (it will then be converted back to 9ft for display)
    if (sliceTemplate.width === undefined) {
      throw new Error('template slice does not have a width defined')
    }
    if (typeof sliceTemplate.width === 'number') {
      if (units === SETTINGS_UNITS_IMPERIAL) {
        const width = sliceTemplate.width * ROUGH_CONVERSION_RATE
        slice.width = normalizeSegmentWidth(
          width,
          resolutionForResizeType(RESIZE_TYPE_INITIAL, units)
        )
      }
    } else {
      slice.width = getWidthInMetric(sliceTemplate.width, units)
    }

    slice.elevation = getElevationValue(
      sliceTemplate.elevation ?? variantInfo.elevation,
      units
    )

    processed.push(slice)
  }

  if (leftHandTraffic) {
    processed.reverse()
  }

  return processed
}

function processTemplateBoundaries(
  boundary: StreetTemplate['boundary'],
  units: UnitsSetting
): StreetState['boundary'] {
  // Set default boundary elevation according to units setting
  const leftBoundary =
    typeof boundary.left.elevation !== 'number'
      ? getWidthInMetric(boundary.left.elevation, units)
      : boundary.left.elevation
  const rightBoundary =
    typeof boundary.right.elevation !== 'number'
      ? getWidthInMetric(boundary.right.elevation, units)
      : boundary.right.elevation

  return {
    left: {
      // Create boundary id
      id: nanoid(),
      ...boundary.left,
      elevation: leftBoundary,
    },
    right: {
      // Create boundary id
      id: nanoid(),
      ...boundary.right,
      elevation: rightBoundary,
    },
  } satisfies StreetState['boundary']
}

function createStreetData(data: StreetTemplate, units: UnitsSetting) {
  const currentDate = new Date().toISOString()
  const slices = processTemplateSlices(data.slices, units)
  const boundary = processTemplateBoundaries(data.boundary, units)
  const creatorId = (isSignedIn() && getSignInData()?.userId) || null

  // Remove `slices` from the existing data because it is being stored
  // as `segments` for backwards compatibility
  const { slices: _discarded, width, ...restData } = data

  // If width is defined as MeasurementValues:
  //  - for metric units, use the metric value as-is
  //  - for US customary units, convert the value to metric
  // If width is defined as a number:
  //  - for metric units, use the value as-is
  //  - for US customary units, convert he value using the _rough_ conversion
  //    rate, e.g. 2.7m => 9ft, then converted back to precise metric units
  //    for storage (it will then be converted back to 9ft for display)
  let widthValue: number

  if (width === undefined) {
    throw new Error('street template does not have a width defined')
  }

  if (typeof width === 'number') {
    if (units === SETTINGS_UNITS_IMPERIAL) {
      widthValue = width * ROUGH_CONVERSION_RATE
    } else {
      widthValue = width
    }
  } else {
    widthValue = getWidthInMetric(width, units)
  }

  const street: Omit<
    StreetState,
    | 'id'
    | 'namespacedId'
    | 'originalStreetId'
    | 'remainingWidth'
    | 'occupiedWidth'
  > = {
    units,
    location: null,
    name: null,
    showAnalytics: true,
    userUpdated: false,
    editCount: 0,
    skybox: DEFAULT_SKYBOX,
    weather: null,
    schemaVersion: LATEST_SCHEMA_VERSION,
    segments: slices,
    updatedAt: currentDate,
    clientUpdatedAt: currentDate,
    creatorId,
    width: widthValue,
    ...restData,
    boundary,
  }

  return street
}

/**
 * This is a Zod validation schema which contains a subset of the properties
 * that are defined in TypeScript. Unfortunately Zod cannot be programmatically
 * created from TypeScript, so we have to manually keep these in sync.
 *
 * The goal is to define all of the required / optional properties that are
 * allowed in a template definition. Later a JSON schema of this can be
 * published as documentation.
 */
const measurementSchema = z.union([
  z.number(),
  z.object({
    metric: z.number(),
    imperial: z.number(),
  }),
])
const boundarySchema = z.object({
  variant: z.string(),
  // It is not required to pass in `floors`, which has a default value of `1`.
  floors: z.number().default(1),
  // By default, elevations are given a metric height. If you want a template
  // to work with round values in US customary units, the template should be
  // defined with `{ metric: 0.15; imperial 0.5; }`
  elevation: measurementSchema.default(0.15),
})
// In order to catch typos or deprecated properties, this validation will
// throw if unknown properties are encountered.
export const StreetTemplate = z.strictObject({
  width: measurementSchema,
  showAnalytics: z.boolean().optional(),
  boundary: z.object({
    left: boundarySchema,
    right: boundarySchema,
  }),
  slices: z.array(
    z.object({
      type: z.string(),
      variant: z.record(z.string(), z.string()),
      width: measurementSchema,
      elevation: measurementSchema.optional(),
      label: z.string().optional(),
      slope: z
        .object({
          on: z.boolean().optional(), // Can be assumed to `true`
          // Values are an array of numbers or measurementSchema objects
          values: z.array(z.union([z.number(), measurementSchema])),
        })
        .optional(),
    })
  ),
})

type StreetTemplate = z.infer<typeof StreetTemplate>

async function getTemplateData(id: string): Promise<StreetTemplate> {
  const response = await window.fetch(`/assets/data/templates/${id}.yaml`)
  const yaml = await response.text()
  const json = load(yaml, {
    schema: JSON_SCHEMA,
  })
  return StreetTemplate.parse(json)
}

// `testUnits` can be passed in to force units apart from Redux store.
// Currently we only use this in tests
export async function prepareStreet(type: string, testUnits?: UnitsSetting) {
  const units = testUnits ?? store.getState().settings.units

  // TODO: handle errors
  // Possible throws:
  // -- file not returned errors (server errors, HTTP errors)
  // -- unparseable as YAML
  // -- unvalidated by Zod
  const streetTemplate = await getTemplateData(type)

  // Here possible errors are:
  // -- transforms to street data go wrong
  // -- types and variants don't exist
  const street = createStreetData(streetTemplate, units)

  store.dispatch(updateStreetData(street))

  if (isSignedIn()) {
    updateLastStreetInfo()
  }
}
