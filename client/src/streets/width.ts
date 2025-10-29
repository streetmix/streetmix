import { Decimal } from 'decimal.js'

import { getSegmentWidthResolution } from '../segments/resizing'
import { SETTINGS_UNITS_IMPERIAL } from '../users/constants'
import {
  MIN_CUSTOM_STREET_WIDTH,
  MAX_CUSTOM_STREET_WIDTH,
  MIN_CUSTOM_STREET_WIDTH_IMPERIAL,
  MAX_CUSTOM_STREET_WIDTH_IMPERIAL
} from './constants'

import type { Segment, StreetJson, UnitsSetting } from '@streetmix/types'

export interface CalculatedWidths {
  streetWidth: Decimal
  occupiedWidth: Decimal
  remainingWidth: Decimal
}

/**
 * Given an input width value, constrains the value to the
 * minimum or maximum value, then rounds it to nearest precision
 */
export function normalizeStreetWidth (
  width: number,
  units: UnitsSetting
): number {
  const minValue =
    units === SETTINGS_UNITS_IMPERIAL
      ? MIN_CUSTOM_STREET_WIDTH_IMPERIAL
      : MIN_CUSTOM_STREET_WIDTH
  const maxValue =
    units === SETTINGS_UNITS_IMPERIAL
      ? MAX_CUSTOM_STREET_WIDTH_IMPERIAL
      : MAX_CUSTOM_STREET_WIDTH

  // Clamp width within bounds, round to nearest resolution, rounds to 3 decimal
  // places (needed for imperial units) and returns number
  return new Decimal(width)
    .clampedTo(minValue, maxValue)
    .toNearest(getSegmentWidthResolution(units))
    .toDecimalPlaces(3)
    .toNumber()
}

/**
 * Adds up all the segment widths to get the total occupied width
 * An empty array should return 0
 * Uses decimal.js to avoid floating point errors during addition
 */
function calculateOccupiedWidth (segments: Segment[] = []): Decimal {
  return segments
    .map((segment) => segment.width)
    .reduce((occupiedWidth, width) => occupiedWidth.plus(width), new Decimal(0))
}

/**
 * Subtracts occupied width from street width to get remaining width.
 * Uses decimal.js to avoid floating point errors during subtraction
 * However, aggregate segment values might not add up exactly to occupied
 * width so handle small near-zero values as well
 */
function calculateRemainingWidth (
  streetWidth: Decimal,
  occupiedWidth: Decimal
): Decimal {
  const remainingWidth = streetWidth.minus(occupiedWidth)

  // Rounding problems :·(
  // Even after adopting decimal.js, this resulting calculation may still be a
  // very small non-zero number. This tends to happen in imperial units
  // (because the values are converted from metric), or can happen metric after
  // being converted from imperial units. When a remaining width value is below
  // this threshold, just return zero
  if (remainingWidth.abs().lt(0.01)) {
    return new Decimal(0)
  }

  return remainingWidth.toDecimalPlaces(3)
}

/**
 * Given a street data object, calculate and store the following values:
 *    - The street width
 *    - How much of the street is occupied by segments, if any
 *    - The remaining width not occupied, if any
 *
 * This is returned in Decimal format for future processing. Make sure to
 * convert data to `number` types before serializing.
 */
export function recalculateWidth (street: StreetJson): CalculatedWidths {
  // Determine occupied and remaining width
  const streetWidth = new Decimal(street.width)
  const occupiedWidth = calculateOccupiedWidth(street.segments)
  const remainingWidth = calculateRemainingWidth(streetWidth, occupiedWidth)

  return {
    streetWidth,
    occupiedWidth,
    remainingWidth
  }
}
