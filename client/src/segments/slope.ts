import type { StreetJson } from '@streetmix/types'

export interface SlopeCalculation {
  leftElevation: number
  rightElevation: number
  slope: string
  ratio: number | undefined
  warnings: {
    slopeExceededBerm: boolean
    slopeExceededPath: boolean
  }
}

export function calculateSlope (
  street: StreetJson,
  index: number
): SlopeCalculation {
  const slice = street.segments[index]

  // Get elevation of slices adjacent to current slice
  let leftElevation = street.segments[index - 1]?.elevation
  let rightElevation = street.segments[index + 1]?.elevation

  // If slice is first or last in the list, adjacent elevation is
  // taken from boundary
  if (index === 0) {
    leftElevation = street.boundary.left.elevation
  }
  if (index === street.segments.length - 1) {
    rightElevation = street.boundary.right.elevation
  }

  // If slope is off, don't calculate the change in elevation, even if
  // neighboring elevation differs
  const rise = slice.slope ? Math.abs(leftElevation - rightElevation) : 0

  // Get slope in percentage
  const slope = ((rise / slice.width) * 100).toFixed(2)

  // Get slope as ratio (horizontal:vertical)
  // If rise is 0, return undefined to prevent divide by zero error
  const ratio = rise !== 0 ? Number((slice.width / rise).toFixed(2)) : undefined

  // Warnings for exceeded slope
  // There are two thresholds:
  // (1) for berms:
  //    "Slopes of 3H:1V (Horizontal:Vertical) are recommended for stability
  //    and ease of maintenance"
  // (2) for paths:
  //    "ADA accessibility and connection to inland area and waterfront is
  //    required. Accessible routes shall not exceed 5% (1V:20H
  //    (vertical:horizontal)) slope"
  const warnings = {
    slopeExceededBerm: ratio !== undefined && ratio < 3,
    slopeExceededPath: ratio !== undefined && ratio < 20
  }

  return {
    leftElevation,
    rightElevation,
    slope,
    ratio,
    warnings
  }
}
