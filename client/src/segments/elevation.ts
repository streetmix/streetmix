import { getWidthInMetric } from '~/src/util/width_units'

import type { MeasurementValues, UnitsSetting } from '@streetmix/types'

export function getElevationValue(
  elevation: number | MeasurementValues | undefined,
  units: UnitsSetting
): number {
  if (typeof elevation === 'number') {
    return elevation
  } else if (typeof elevation !== 'undefined') {
    return getWidthInMetric(elevation, units)
  } else {
    return 0
  }
}
