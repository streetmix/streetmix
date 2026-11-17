import { Decimal } from 'decimal.js'

import { SETTINGS_UNITS_IMPERIAL } from '~/src/users/constants.js'
import {
  CURB_HEIGHT,
  ELEVATION_INCREMENT,
  ELEVATION_INCREMENT_IMPERIAL,
  MAX_ELEVATION_IMPERIAL,
  MAX_ELEVATION_METRIC,
  MIN_ELEVATION,
} from './constants.js'

import type { StreetJson } from '@streetmix/types'

export function getSlopeValues(
  street: StreetJson,
  index: number
): [number, number] {
  const leftSlice = street.segments[index - 1]
  const rightSlice = street.segments[index + 1]

  let leftElevation
  let rightElevation

  // Get the elevation of adjacent left slice.
  if (leftSlice) {
    // Use the adjacent slope anchor value, or flat elevation
    if (leftSlice.slope.on) {
      leftElevation = leftSlice.slope.values[1]
    } else {
      leftElevation = leftSlice.elevation
    }
    // If there is not an adjacent slice, take elevation from boundary.
    // A fallback value is used for older street that don't have boundary data
  } else {
    leftElevation = street.boundary?.left.elevation ?? CURB_HEIGHT
  }

  // Get the elevation of adjacent right slice.
  if (rightSlice) {
    // Use the adjacent slope anchor value, or flat elevation
    if (rightSlice.slope.on) {
      rightElevation = rightSlice.slope.values[0]
    } else {
      rightElevation = rightSlice.elevation
    }
    // If there is not an adjacent slice, take elevation from boundary.
    // A fallback value is used for older street that don't have boundary data
  } else {
    rightElevation = street.boundary?.right.elevation ?? CURB_HEIGHT
  }

  // If the left and and right elevations are equal, then this returns a flat
  // elevation, and it's usually not what someone expects to see when someone
  // toggles the slope on. In this case, create some values using the slice's
  // current (flat) elevation to make it an expected slope.
  if (leftElevation === rightElevation) {
    const currentElevation = street.segments[index].elevation

    // TODO: consolidate with `handleIncrement` and `handleDecrement` in
    // <ElevationControlNew />
    const increment =
      street.units === SETTINGS_UNITS_IMPERIAL
        ? ELEVATION_INCREMENT_IMPERIAL
        : ELEVATION_INCREMENT
    const maxValue =
      street.units === SETTINGS_UNITS_IMPERIAL
        ? MAX_ELEVATION_IMPERIAL
        : MAX_ELEVATION_METRIC

    leftElevation = new Decimal(currentElevation)
      .plus(increment)
      .plus(increment)
      .clamp(MIN_ELEVATION, maxValue)
      .toDecimalPlaces(3)
      .toNumber()

    rightElevation = new Decimal(currentElevation)
      .minus(increment)
      .minus(increment)
      .clamp(MIN_ELEVATION, maxValue)
      .toDecimalPlaces(3)
      .toNumber()
  }

  return [leftElevation, rightElevation]
}

export function getRiseRunValues(values: [number, number], width: number) {
  // Calculate the rise of the slope
  const rise = Math.abs(values[0] - values[1])

  // Get slope in percentage
  const slope = ((rise / width) * 100).toFixed(2)

  // Get slope as ratio (horizontal:vertical)
  // Do not calculate if rise is 0, because that's a divide by zero error
  let ratio
  if (rise !== 0) {
    ratio = Number((width / rise).toFixed(2))
  }

  return {
    slope,
    ratio,
  }
}

export function getSlopeWarnings(ratio: number | undefined) {
  // Warnings for exceeded slope
  // There are two thresholds:
  // (1) for berms:
  //    "Slopes of 3H:1V (Horizontal:Vertical) are recommended for stability
  //    and ease of maintenance"
  // (2) for paths:
  //    "ADA accessibility and connection to inland area and waterfront is
  //    required. Accessible routes shall not exceed 5% (1V:20H
  //    (vertical:horizontal)) slope"
  return {
    slopeExceededBerm: ratio !== undefined && ratio < 3,
    slopeExceededPath: ratio !== undefined && ratio < 20,
  }
}
