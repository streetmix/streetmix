import { uniq, intersection } from 'es-toolkit/array'
import {
  getBoundaryItem,
  getSegmentInfo,
  getSegmentVariantInfo,
  SliceTypes,
} from '@streetmix/parts'
import { convertImperialMeasurementToMetric } from '@streetmix/utils'

import { SEA_LEVEL_RISE_FEET, SURGE_HEIGHT_FEET } from './constants.js'

import type { FloodDetails, SliceItem, StreetState } from '@streetmix/types'

const disallowFlooding = [
  SliceTypes.CAR,
  SliceTypes.BIKE,
  SliceTypes.TRANSIT,
  SliceTypes.BIKE,
  // Maybe okay to flood, if we're lax about it!
  // SliceTypes.FURNITURE,
  // SliceTypes.FLEX,
  SliceTypes.UTILITY,
]

// Returns total sea level rise in metric values
// Takes into account storm surge levels
// TODO: streamline by doing base calculation in metric, then convert back to
// imperial if needed.
export function calculateSeaLevelRise(
  seaLevelRise: number,
  stormSurge: boolean,
  street: StreetState
) {
  let heightFeet = 0

  // Get base sea level.
  // If either boundary is a waterfront, check how high it is
  let baseSeaLevel = 0

  const left = getBoundaryItem(street.boundary.left.variant)
  const right = getBoundaryItem(street.boundary.right.variant)
  if (left.waterfront) {
    baseSeaLevel = street.boundary.left.elevation
  } else if (right.waterfront) {
    baseSeaLevel = street.boundary.right.elevation
  }

  if (seaLevelRise in SEA_LEVEL_RISE_FEET) {
    heightFeet +=
      SEA_LEVEL_RISE_FEET[seaLevelRise as keyof typeof SEA_LEVEL_RISE_FEET]
  }

  if (stormSurge) {
    heightFeet += SURGE_HEIGHT_FEET
  }

  const height = convertImperialMeasurementToMetric(heightFeet)

  return baseSeaLevel + height
}

// Given the slices of a street section, and sea level rise height, calculate
// how far it floods before being blocked by a higher elevation, and collect
// a list of affected slice types.
//
// Flooding distance will not take into account empty space in the section,
// or overflow space beyond the street boundaries. This ONLY calculates distance
// from the edge of the slices themselves.
export function calculateFloodDetails(
  slices: SliceItem[],
  floodHeight: number,
  direction: 'left' | 'right'
): FloodDetails {
  const fromLeft = direction === 'left'
  const floodedTypes = []
  let floodDistance = 0

  // Loop direction changes depending on whether or not we are starting from
  // the left or the right. Doing n+1 / n-1 is faster than reversing the array
  // just to keep the loop counting in one direction.
  for (
    let i = fromLeft ? 0 : slices.length - 1;
    fromLeft ? i < slices.length : i >= 0;
    fromLeft ? i++ : i--
  ) {
    const slice = slices[i]
    const sliceInfo = getSegmentInfo(slice.type)
    const variantInfo = getSegmentVariantInfo(slice.type, slice.variantString)

    let isSloped = false
    if (!('unknown' in variantInfo)) {
      const allowSlope =
        variantInfo.slope === 'path' || variantInfo.slope === 'berm'
      isSloped = allowSlope && slice.slope.on
    }

    // Slices can block a flood based on its elevation.
    // First, check slope elevations. Slice must be sloped (it is set, and
    // the variant must allow slope)
    if (isSloped) {
      const near = fromLeft ? 0 : 1
      const far = fromLeft ? 1 : 0

      // If the nearest slope endpoint is higher than the flood height, the
      // slice blocks the flood. We can stop checking this slice
      if (slice.slope.values[near] >= floodHeight) break

      // If the farthest slope endpoint is higher than the flood height, the
      // slice partially blocks the flood.
      if (slice.slope.values[far] >= floodHeight) {
        // Calculate partial distance based on slope
        const rise = slice.slope.values[far] - slice.slope.values[near]

        // This is a rise/run formula
        // This does not handle a divide-by-zero (rise = 0), but we should never
        // reach this point (it gets blocked by earlier break)
        const partialDistance =
          (slice.width / rise) * (floodHeight - slice.slope.values[near])

        floodDistance += partialDistance
        floodedTypes.push(sliceInfo.owner)
        break
      } else {
        // If neither slope endpoint is higher than the flood height, this
        // slice is fully flooded.
        floodDistance += slice.width
        floodedTypes.push(sliceInfo.owner)
      }
    } else {
      // If not sloped, check the slice's flat elevation.
      let compareElevation = slice.elevation

      // The elevation to check is modified by an additional value if the
      // slice owner type is WALL.
      // Walls are a special case that is capable of blocking a flood (like a
      // seawall, etc).
      // TODO: Don't hardcode these height numbers
      if (sliceInfo.owner === SliceTypes.WALL) {
        if (slice.variant['wall-height'] === 'low') {
          compareElevation += 1
        } else {
          // High wall variant
          compareElevation += 2.15
        }
      }

      // If the elevation is greater, then the slice blocks the flood. We can
      // stop checking
      if (compareElevation >= floodHeight) break

      // If the elevation is less, then the slice is fully flooded.
      floodDistance += slice.width
      floodedTypes.push(sliceInfo.owner)
    }

    // If we've come here, then the flood distance is beyond the section,
    // so we assign a value of Infinity.
    if (i === (fromLeft ? slices.length - 1 : 0)) {
      floodDistance += Infinity
    }
  }

  // Collapse down to unique values and filter out `undefined`
  const filteredFloodedTypes = uniq(floodedTypes).filter((t) => t !== undefined)

  return {
    direction,
    // if `floodDistance` is infinite, return `max` instead because `Infinity`
    // is not a serializable value in JSON.
    distance: floodDistance === Infinity ? 'max' : floodDistance,
    floodedTypes: filteredFloodedTypes,
    flooded: intersection(disallowFlooding, filteredFloodedTypes).length > 0,
  }
}

export function checkSeaLevel(
  street: StreetState,
  seaLevelRise: number,
  stormSurge: boolean
): [FloodDetails | null, FloodDetails | null] {
  const height = calculateSeaLevelRise(seaLevelRise, stormSurge, street)

  const { boundary, segments: slices } = street

  const floodDetails: [FloodDetails | null, FloodDetails | null] = [null, null]

  if (boundary.left.variant && boundary.right.variant) {
    if (getBoundaryItem(boundary.left.variant).waterfront) {
      floodDetails[0] = calculateFloodDetails(slices, height, 'left')
    }
    if (getBoundaryItem(boundary.right.variant).waterfront) {
      floodDetails[1] = calculateFloodDetails(slices, height, 'right')
    }
  }

  return floodDetails
}
