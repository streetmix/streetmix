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
import { updateLastStreetInfo } from './xhr'

import defaultStreetTemplate from './templates/default.yaml'
import emptyStreetTemplate from './templates/empty.yaml'
import harborwalkTemplate from './templates/harborwalk.yaml'

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
const LATEST_SCHEMA_VERSION = 32

function processTemplateSlices (
  slices: SliceItemTemplate[],
  units: UnitsSetting
) {
  const processed = []
  const leftHandTraffic = getLeftHandTraffic()

  for (const i in slices) {
    const slice = clone(slices[i]) as SliceItem

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
    slice.variantString = getVariantString(slice.variant)

    const variantInfo = getSegmentVariantInfo(slice.type, slice.variantString)

    slice.id = nanoid()

    // Convert slice width for imperial using rough conversion rate
    // e.g. 2.7m => 9ft, and then converted to precise metric units
    // so that it can be converted back to 9ft
    if (units === SETTINGS_UNITS_IMPERIAL) {
      const width = slice.width * ROUGH_CONVERSION_RATE
      slice.width = normalizeSegmentWidth(
        width,
        resolutionForResizeType(RESIZE_TYPE_INITIAL, units)
      )
    }

    slice.elevation = variantInfo.elevation ?? 0
    slice.warnings = [false]

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

  if (units === SETTINGS_UNITS_IMPERIAL) {
    street.width *= ROUGH_CONVERSION_RATE
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
    case STREET_TEMPLATES.HARBORWALK:
    case STREET_TEMPLATES.COASTAL_ROAD:
    case STREET_TEMPLATES.BEACH:
      streetTemplate = harborwalkTemplate as StreetTemplate
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
