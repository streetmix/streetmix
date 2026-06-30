import { convertImperialMeasurementToMetric } from '~/src/util/width_units.js'
import { getBoundaryItem } from '~/src/boundary/boundary.js'
import { SEA_LEVEL_RISE_FEET, SURGE_HEIGHT_FEET } from './constants.js'

import type { FloodDistance, SliceItem, StreetState } from '@streetmix/types'

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

    // Walls are a special case that is capable of blocking a flood (like a
    // seawall, etc). So its compare elevation will be higher
    // TODO: Don't hardcode these height numbers
    if (slice.type === 'wall') {
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

    return distance - extraDistance
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
    return distance
  }
}

export function checkSeaLevel(
  street: StreetState,
  streetEl: HTMLDivElement | null,
  canvasEl: HTMLElement | null,
  seaLevelRise: number,
  stormSurge: boolean
): [FloodDistance, FloodDistance] {
  const height = calculateSeaLevelRise(seaLevelRise, stormSurge, street)

  const { boundary, segments: slices } = street
  const floodDistance = [null, null] as [FloodDistance, FloodDistance]

  if (boundary.left.variant && boundary.right.variant) {
    if (getBoundaryItem(boundary.left.variant).waterfront) {
      floodDistance[0] = calculateFloodDistance(
        slices,
        height,
        'left',
        streetEl,
        canvasEl
      )
    }
    if (getBoundaryItem(boundary.right.variant).waterfront) {
      floodDistance[1] = calculateFloodDistance(
        slices,
        height,
        'right',
        streetEl,
        canvasEl
      )
    }
  }

  return floodDistance
}
