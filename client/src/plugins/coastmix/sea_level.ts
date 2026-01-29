import { convertImperialMeasurementToMetric } from '~/src/util/width_units.js'
import { SEA_LEVEL_RISE_FEET, SURGE_HEIGHT_FEET } from './constants.js'

import type { StreetState } from '@streetmix/types'
import type { CoastmixState } from '~src/store/slices/coastmix.js'

export function checkSeaLevel(
  street: StreetState,
  coastmix: CoastmixState
): number | null {
  const { seaLevelRise, floodDirection, stormSurge } = coastmix

  const slices = street.segments

  let heightFeet = 0
  if (seaLevelRise in SEA_LEVEL_RISE_FEET) {
    heightFeet +=
      SEA_LEVEL_RISE_FEET[seaLevelRise as keyof typeof SEA_LEVEL_RISE_FEET]
  }
  if (stormSurge) {
    heightFeet += SURGE_HEIGHT_FEET
  }

  const height = convertImperialMeasurementToMetric(heightFeet)

  let slicePosition
  if (floodDirection === 'left') {
    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i]
      // TODO: handle wall.
      if (slice.elevation >= height) {
        slicePosition = i
        break
      }
    }

    // Bail early if no slice meets or exceeds flood height.
    if (typeof slicePosition !== 'number') {
      return null
    }

    const sliceEl = document
      .getElementById('street-section-editable')!
      .querySelector<HTMLElement>(`[data-slice-index="${slicePosition}"]`)

    const distance = Number(sliceEl?.dataset.sliceLeft)
    return distance
  } else if (floodDirection === 'right') {
    for (let i = slices.length - 1; i >= 0; i--) {
      const slice = slices[i]
      // TODO: handle wall.
      if (slice.elevation >= height) {
        slicePosition = i
        break
      }
    }

    // Bail early if no slice meets or exceeds flood height.
    if (typeof slicePosition !== 'number') {
      return null
    }

    const sliceEl = document
      .getElementById('street-section-editable')!
      .querySelector<HTMLElement>(`[data-slice-index="${slicePosition}"]`)

    // There are some extra steps for calculating the right-hand distance
    const parentWidth =
      sliceEl?.closest<HTMLElement>('#street-section-canvas')?.offsetWidth ?? 0
    const offsetLeftPlusWidth =
      Number(sliceEl?.dataset.sliceLeft) + (sliceEl?.offsetWidth ?? 0)

    const distance = parentWidth - offsetLeftPlusWidth
    return distance
  }

  return null
}
