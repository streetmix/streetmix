import { CURB_HEIGHT } from './constants.js'

import type { StreetJson } from '@streetmix/types'

export interface SlopeCalculation {
  values: number[]
  slope: string
  ratio: number | undefined
  warnings: {
    slopeExceededBerm: boolean
    slopeExceededPath: boolean
  }
}

export function getSlopeValues(street: StreetJson, index: number): number[] {
  // Get elevation of slices adjacent to current slice
  let leftElevation = street.segments[index - 1]?.elevation
  let rightElevation = street.segments[index + 1]?.elevation

  // If slice is first or last in the list, adjacent elevation is
  // taken from boundary. A fallback value is used for older streets
  // that don't have boundary data
  if (index === 0) {
    leftElevation = street.boundary?.left.elevation ?? CURB_HEIGHT
  }
  if (index === street.segments.length - 1) {
    rightElevation = street.boundary?.right.elevation ?? CURB_HEIGHT
  }

  return [leftElevation, rightElevation]
}

export function getRiseRunValues(values: number[], width: number) {
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

export function calculateSlope(
  street: StreetJson,
  index: number
): SlopeCalculation {
  const slice = street.segments[index]

  let values: number[] = []
  let slope = '0'
  let ratio

  // Only calculate values if slope is on
  // `slope` property may not be present on older streets
  if (slice.slope?.on) {
    values = getSlopeValues(street, index)
    const slopeData = getRiseRunValues(values, slice.width)

    slope = slopeData.slope
    ratio = slopeData.ratio
  }

  const warnings = getSlopeWarnings(ratio)

  return {
    values,
    slope,
    ratio,
    warnings,
  }
}
