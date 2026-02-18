import { convertImperialMeasurementToMetric } from '~/src/util/width_units.js'
import { SEA_LEVEL_RISE_FEET, SURGE_HEIGHT_FEET } from './constants.js'

import type { FloodDirection, SliceItem } from '@streetmix/types'

// Returns total sea level rise in metric values
// Takes into account storm surge levels
export function calculateSeaLevelRise(
  seaLevelRise: number,
  stormSurge: boolean
) {
  let heightFeet = 0

  if (seaLevelRise in SEA_LEVEL_RISE_FEET) {
    heightFeet +=
      SEA_LEVEL_RISE_FEET[seaLevelRise as keyof typeof SEA_LEVEL_RISE_FEET]
  }

  if (stormSurge) {
    heightFeet += SURGE_HEIGHT_FEET
  }

  const height = convertImperialMeasurementToMetric(heightFeet)

  return height
}

export function checkSeaLevel(
  slices: SliceItem[],
  streetEl: HTMLDivElement | null,
  canvasEl: HTMLElement | null,
  seaLevelRise: number,
  stormSurge: boolean,
  floodDirection: FloodDirection
): number | null {
  const height = calculateSeaLevelRise(seaLevelRise, stormSurge)

  if (streetEl === null || canvasEl === null) return null

  let slicePosition
  if (floodDirection === 'left') {
    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i]

      // Slices can block a flood based on its elevation. Walls are a special
      // case that is capable of blocking a flood (like a seawall, etc)
      // TODO: Don't hardcode these height numbers
      let compareElevation = slice.elevation
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

    // Bail early if no slice meets or exceeds flood height.
    if (typeof slicePosition !== 'number') {
      return null
    }

    const sliceEl = streetEl.querySelector<HTMLElement>(
      `[data-slice-index="${slicePosition}"]`
    )

    const distance = Number(sliceEl?.dataset.sliceLeft)
    return distance
  } else if (floodDirection === 'right') {
    for (let i = slices.length - 1; i >= 0; i--) {
      const slice = slices[i]

      // Slices can block a flood based on its elevation. Walls are a special
      // case that is capable of blocking a flood (like a seawall, etc)
      // TODO: Don't hardcode these height numbers
      let compareElevation = slice.elevation
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

    // Bail early if no slice meets or exceeds flood height.
    if (typeof slicePosition !== 'number') {
      return null
    }

    const sliceEl = streetEl.querySelector<HTMLElement>(
      `[data-slice-index="${slicePosition}"]`
    )

    // There are some extra steps for calculating the right-hand distance
    // NOTE: this is 0 on page load, which causes sea level rendering to fail
    const parentWidth = canvasEl.offsetWidth ?? 0
    const offsetLeftPlusWidth =
      Number(sliceEl?.dataset.sliceLeft) + (sliceEl?.offsetWidth ?? 0)

    const distance = parentWidth - offsetLeftPlusWidth
    return distance
  }

  return null
}
