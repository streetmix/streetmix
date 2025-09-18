import { Decimal } from 'decimal.js'
import { round } from '@streetmix/utils'

import {
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL,
  SEGMENT_WARNING_WIDTH_TOO_LARGE,
  SEGMENT_WARNING_DANGEROUS_EXISTING
} from '../segments/constants'
import { getSegmentVariantInfo } from '../segments/info'
import { getSegmentWidthResolution } from '../segments/resizing'
import { SETTINGS_UNITS_IMPERIAL } from '../users/constants'
import { getWidthInMetric } from '../util/width_units'
import {
  MIN_CUSTOM_STREET_WIDTH,
  MAX_CUSTOM_STREET_WIDTH,
  MIN_CUSTOM_STREET_WIDTH_IMPERIAL,
  MAX_CUSTOM_STREET_WIDTH_IMPERIAL
} from './constants'

import type { Segment, StreetJson, UnitsSetting } from '@streetmix/types'

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
 *    - How much of the street is occupied by segments, if any
 *    - The remaining width not occupied, if any
 *    - Warnings for each segment, if the segment is outside the
 *      street or is too small or too large.
 *
 * @returns {Object} containing calculated occupied width, remaining width,
 *       and clone of segments array with warnings.
 */
export function recalculateWidth (street: StreetJson) {
  // Determine occupied and remaining width
  const streetWidth = new Decimal(street.width)
  const occupiedWidth = calculateOccupiedWidth(street.segments)
  const remainingWidth = calculateRemainingWidth(streetWidth, occupiedWidth)
  const units = street.units

  // Add warnings to segments, if necessary.
  // The position is the left pixel position of each segment. This is initialized
  // with the left pixel of the first segment and will be modified when looking at
  // each subsequent segment.
  let position = streetWidth.dividedBy(2).minus(occupiedWidth.dividedBy(2))

  // Creates an empty array so that we can clone original segments into it.
  const segments: Segment[] = []

  street.segments.forEach((segment: Segment) => {
    const variantInfo = getSegmentVariantInfo(
      segment.type,
      segment.variantString
    )
    const warnings = [false]

    // Apply a warning if any portion of the segment exceeds the boundaries of
    // the street.
    if (
      remainingWidth.abs().gt(0) &&
      (position.lessThan(0) ||
        position.plus(segment.width).greaterThan(streetWidth))
    ) {
      warnings[SEGMENT_WARNING_OUTSIDE] = true
    } else {
      warnings[SEGMENT_WARNING_OUTSIDE] = false
    }

    // Apply a warning if segment width is less than the minimum width
    // defined for this segment type.
    if (
      variantInfo.minWidth !== undefined &&
      segment.width < getWidthInMetric(variantInfo.minWidth, units)
    ) {
      warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = true
    } else {
      warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = false
    }

    // Apply a warning if segment width is greater than the maximum width
    // defined for this segment type.
    if (
      variantInfo.maxWidth &&
      segment.width > getWidthInMetric(variantInfo.maxWidth, units)
    ) {
      warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = true
    } else {
      warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = false
    }

    // Apply a warning if the segment type and variant is the mixed-use
    // drive lane with bicycle, which is a dangerous existing condition
    if (variantInfo.dangerous === true) {
      warnings[SEGMENT_WARNING_DANGEROUS_EXISTING] = true
    } else {
      warnings[SEGMENT_WARNING_DANGEROUS_EXISTING] = false
    }

    // Increment the position counter.
    position = position.add(segment.width)

    segments.push({
      ...segment,
      warnings
    })
  })

  return {
    occupiedWidth: occupiedWidth.toNumber(),
    remainingWidth: remainingWidth.toNumber(),
    segments
  }
}
