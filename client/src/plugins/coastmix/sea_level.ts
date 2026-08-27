import { uniq, intersection } from 'es-toolkit/array'
import { getBoundaryItem, getSegmentInfo, SliceTypes } from '@streetmix/parts'
import { convertImperialMeasurementToMetric } from '@streetmix/utils'

import { SEA_LEVEL_RISE_FEET, SURGE_HEIGHT_FEET } from './constants.js'

import type {
  FloodDistance,
  FloodDetails,
  SliceItem,
  StreetState,
} from '@streetmix/types'

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

    // Slices can block a flood based on its elevation.
    // First, check slope elevations.
    if (slice.slope.on) {
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

function calculateFloodDistance(
  slices: SliceItem[],
  height: number,
  direction: 'left' | 'right',
  streetEl: HTMLDivElement | null,
  canvasEl: HTMLElement | null
): FloodDistance {
  if (streetEl === null || canvasEl === null) {
    return null
  }

  // Depending on whether the flood comes from the left or right, set up
  // a compare loop that counts up or down
  const fromLeft = direction === 'left'
  const start = fromLeft ? 0 : slices.length - 1
  const end = fromLeft ? slices.length : -1
  const step = fromLeft ? 1 : -1

  let slicePosition

  for (let i = start; fromLeft ? i < end : i > end; i += step) {
    const slice = slices[i]

    let compareElevation: number

    // Slices can block a flood based on its elevation.
    // First, see if this slice is sloped.
    // If sloped, a slice blocks a flood if any of its endpoints are higher
    // than the height.
    if (slice.slope.on) {
      compareElevation = Math.max(slice.slope.values[0], slice.slope.values[1])
    } else {
      // If not sloped, we look at the slice's flat elevation.
      compareElevation = slice.elevation
    }

    const sliceInfo = getSegmentInfo(slice.type)

    // Walls are a special case that is capable of blocking a flood (like a
    // seawall, etc). So its compare elevation will be higher
    // TODO: Don't hardcode these height numbers
    if (sliceInfo.owner === SliceTypes.WALL) {
      if (slice.variant['wall-height'] === 'low') {
        compareElevation += 1
      } else {
        // High wall variant
        compareElevation += 2.15
      }
    }

    // If this slice blocks a flood, record its position and exit loop
    if (compareElevation >= height) {
      slicePosition = i
      break
    }
  }

  // If no slice meets or exceeds flood height, use the value 'max' to stand in
  // for "we will flood all of it." We don't want to return `Infinity` because
  // that value is not serializable to JSON!
  if (typeof slicePosition !== 'number') {
    return 'max'
  }

  // Get the pixel position of the blocking element
  const sliceEl = streetEl.querySelector<HTMLElement>(
    `[data-slice-index="${slicePosition}"]`
  )

  if (fromLeft) {
    const distance = Number(sliceEl?.dataset.sliceLeft)

    // If sloped, how far does flood go before it hits the slope?
    const slice = slices[slicePosition]
    let extraDistance = 0
    if (slice.slope.on) {
      const rise = slice.slope.values[1] - slice.slope.values[0]
      if (rise > 0 && height > slice.slope.values[0]) {
        const run = sliceEl?.offsetWidth ?? 0 // This is the width of item
        // This is a rise/run formula
        extraDistance = (run / rise) * (slice.slope.values[0] - height)
      }
    }

    // Clamp lower bound of return value to 0 (rounding errors may result
    // in slightly negative values)
    return Math.max(distance - extraDistance, 0)
  } else {
    // There are some extra steps for calculating the right-hand distance
    // which is based on the width of the on-screen canvasEl element.
    // The timing of when this function is called is important because
    // putting it in the wrong place could cause the element to not be
    // present, or not yet have an `offsetWidth` value. We can remove this
    // by switching to calculating flood distance in real world values
    // rather than on-screen pixel values.
    const parentWidth = canvasEl.offsetWidth ?? 0
    const offsetLeftPlusWidth =
      Number(sliceEl?.dataset.sliceLeft) + (sliceEl?.offsetWidth ?? 0)

    // If sloped, how far does flood go before it hits the slope?
    const slice = slices[slicePosition]
    let extraDistance = 0
    if (slice.slope.on) {
      const rise = slice.slope.values[0] - slice.slope.values[1]
      if (rise > 0 && height > slice.slope.values[1]) {
        const run = sliceEl?.offsetWidth ?? 0 // This is the width of item
        // This is a rise/run formula
        extraDistance = -(run / rise) * (height - slice.slope.values[1])
      }
    }

    const distance = parentWidth - offsetLeftPlusWidth - extraDistance

    // Clamp lower bound of return value to 0 (rounding errors may result
    // in slightly negative values)
    return Math.max(distance, 0)
  }
}

export function checkSeaLevel(
  street: StreetState,
  streetEl: HTMLDivElement | null,
  canvasEl: HTMLElement | null,
  seaLevelRise: number,
  stormSurge: boolean
): {
  floodDistance: [FloodDistance, FloodDistance]
  floodDetails: [FloodDetails | null, FloodDetails | null]
} {
  const height = calculateSeaLevelRise(seaLevelRise, stormSurge, street)

  const { boundary, segments: slices } = street
  const floodDistance = [null, null] as [FloodDistance, FloodDistance]
  const floodDetails: [FloodDetails | null, FloodDetails | null] = [null, null]

  if (boundary.left.variant && boundary.right.variant) {
    if (getBoundaryItem(boundary.left.variant).waterfront) {
      floodDistance[0] = calculateFloodDistance(
        slices,
        height,
        'left',
        streetEl,
        canvasEl
      )
      floodDetails[0] = calculateFloodDetails(slices, height, 'left')
    }
    if (getBoundaryItem(boundary.right.variant).waterfront) {
      floodDistance[1] = calculateFloodDistance(
        slices,
        height,
        'right',
        streetEl,
        canvasEl
      )
      floodDetails[1] = calculateFloodDetails(slices, height, 'right')
    }
  }

  return { floodDistance, floodDetails }
}
