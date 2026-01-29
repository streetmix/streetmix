import store from '~/src/store'
import { convertImperialMeasurementToMetric } from '~/src/util/width_units'
import { SEA_LEVEL_RISE_FEET, SURGE_HEIGHT_FEET } from './constants'

export function checkSeaLevel() {
  const { seaLevelRise, floodDirection, stormSurge } = store.getState().coastmix
  const street = store.getState().street

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
  if (floodDirection === 'right') {
    for (let i = slices.length - 1; i >= 0; i--) {
      const slice = slices[i]
      // TODO: handle wall.
      if (slice.elevation >= height) {
        slicePosition = i
        break
      }
    }

    const sliceEl = document
      .getElementById('street-section-editable')!
      .querySelector<HTMLElement>(`[data-slice-index="${slicePosition}"]`)

    return Number(sliceEl?.dataset.sliceLeft) + (sliceEl?.offsetWidth ?? 0)
  } else if (floodDirection === 'left') {
    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i]
      // TODO: handle wall.
      if (slice.elevation >= height) {
        slicePosition = i
        break
      }
    }

    const sliceEl = document
      .getElementById('street-section-editable')!
      .querySelector<HTMLElement>(`[data-slice-index="${slicePosition}"]`)

    return Number(sliceEl?.dataset.sliceLeft)
  }
}
