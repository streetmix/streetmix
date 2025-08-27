import { nanoid } from 'nanoid'
import clone from 'just-clone'

import { STREET_TEMPLATES } from '../app/constants'
import {
  normalizeSegmentWidth,
  resolutionForResizeType,
  RESIZE_TYPE_INITIAL
} from '../segments/resizing'
import { getVariantString } from '../segments/variant_utils'
import { getSignInData, isSignedIn } from '../users/authentication'
import { SETTINGS_UNITS_IMPERIAL } from '../users/constants'
import { getLeftHandTraffic } from '../users/localization'
import { updateStreetData } from '../store/slices/street'
import store from '../store'
import { getSegmentVariantInfo } from '../segments/info'
import { DEFAULT_SKYBOX } from '../sky/constants'
import { getWidthInMetric } from '../util/width_units'
import { updateLastStreetInfo } from './xhr'

import defaultStreetTemplate from './templates/default.yaml'
import emptyStreetTemplate from './templates/empty.yaml'
import beachTemplate from './templates/beach.yaml'
import coastalRoadTemplate from './templates/coastal_road.yaml'
import harborwalkTemplate from './templates/harborwalk.yaml'
import stroadTemplate from './templates/stroad.yaml'

import type {
  SliceItem,
  SliceItemTemplate,
  StreetState,
  StreetTemplate,
  UnitsSetting
} from '@streetmix/types'

// TODO: put together with other measurement conversion code?
const ROUGH_CONVERSION_RATE = (10 / 3) * 0.3048

// Server is now the source of truth of this value
const LATEST_SCHEMA_VERSION = 33

function processTemplateSlices (
  slices: SliceItemTemplate[],
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
      warnings: [false]
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

    // If width is defined as a WidthDefinition:
    //  - for metric units, use the metric value as-is
    //  - for US customary units, convert the value to metric
    // If width is defined as a number:
    //  - for metric units, use the value as-is
    //  - for US customary units, convert he value using the _rough_ conversion
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

    slice.elevation = variantInfo.elevation ?? 0

    processed.push(slice)
  }

  if (leftHandTraffic) {
    processed.reverse()
  }

  return processed
}

// Exported for test only
export function createStreetData (data: StreetTemplate, units: UnitsSetting) {
  const currentDate = new Date().toISOString()
  const slices = processTemplateSlices(data.slices, units)
  const creatorId = (isSignedIn() && getSignInData().userId) ?? null
  const street: Partial<StreetState> = {
    units,
    location: null,
    name: null,
    showAnalytics: true,
    userUpdated: false,
    editCount: 0,
    skybox: DEFAULT_SKYBOX,
    schemaVersion: LATEST_SCHEMA_VERSION,
    segments: slices,
    updatedAt: currentDate,
    clientUpdatedAt: currentDate,
    creatorId,
    ...data
  }

  // Create boundary ids
  street.boundary.left.id = nanoid()
  street.boundary.right.id = nanoid()

  // Cleanup
  delete street.slices

  // If width is defined as a WidthDefinition:
  //  - for metric units, use the metric value as-is
  //  - for US customary units, convert the value to metric
  // If width is defined as a number:
  //  - for metric units, use the value as-is
  //  - for US customary units, convert he value using the _rough_ conversion
  //    rate, e.g. 2.7m => 9ft, then converted back to precise metric units
  //    for storage (it will then be converted back to 9ft for display)
  if (street.width === undefined) {
    throw new Error('street template does not have a width defined')
  }
  if (typeof street.width === 'number') {
    if (units === SETTINGS_UNITS_IMPERIAL) {
      street.width *= ROUGH_CONVERSION_RATE
    }
  } else {
    street.width = getWidthInMetric(street.width, units)
  }

  return street
}

export function prepareStreet (type: string) {
  const units = store.getState().settings.units

  let streetTemplate
  switch (type) {
    case STREET_TEMPLATES.EMPTY:
      streetTemplate = emptyStreetTemplate as StreetTemplate
      break
    case STREET_TEMPLATES.STROAD:
      streetTemplate = stroadTemplate as StreetTemplate
      break
    case STREET_TEMPLATES.HARBORWALK:
      streetTemplate = harborwalkTemplate as StreetTemplate
      break
    case STREET_TEMPLATES.COASTAL_ROAD:
      streetTemplate = coastalRoadTemplate as StreetTemplate
      break
    case STREET_TEMPLATES.BEACH:
      streetTemplate = beachTemplate as StreetTemplate
      break
    case STREET_TEMPLATES.DEFAULT:
    default:
      streetTemplate = defaultStreetTemplate as StreetTemplate
      break
  }
  const street = createStreetData(streetTemplate, units)

  store.dispatch(updateStreetData(street))

  if (isSignedIn()) {
    updateLastStreetInfo()
  }
}
