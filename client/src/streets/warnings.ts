import { getSegmentVariantInfo } from '@streetmix/parts'

import {
  SLICE_WARNING_OUTSIDE,
  SLICE_WARNING_WIDTH_TOO_SMALL,
  SLICE_WARNING_WIDTH_TOO_LARGE,
  SLICE_WARNING_DANGEROUS_EXISTING,
  SLICE_WARNING_SLOPE_EXCEEDED_BERM,
  SLICE_WARNING_SLOPE_EXCEEDED_PATH,
} from '../segments/constants.js'
import { getRiseRunValues, getSlopeWarnings } from '../segments/slope.js'
import { getWidthInMetric } from '../util/width_units.js'

import type { SliceItem, StreetJson } from '@streetmix/types'
import type { CalculatedWidths } from './width.js'

/**
 * Applies warnings to slices, if necessary.
 */
export function applyWarningsToSlices(
  slices: SliceItem[], // This is a copy we can edit
  street: StreetJson, // This is original street data that we need
  calculatedWidths: CalculatedWidths
): SliceItem[] {
  const { streetWidth, occupiedWidth, remainingWidth } = calculatedWidths

  // The position is the left pixel position of each segment. This is initialized
  // with the left pixel of the first segment and will be modified when looking at
  // each subsequent segment.
  let position = streetWidth.dividedBy(2).minus(occupiedWidth.dividedBy(2))

  slices.forEach((slice: SliceItem) => {
    const variantInfo = getSegmentVariantInfo(slice.type, slice.variantString)

    // Apply a warning if any portion of the slice exceeds the boundaries of
    // the street.
    if (
      remainingWidth.abs().gt(0) &&
      (position.lessThan(0) ||
        position.plus(slice.width).greaterThan(streetWidth))
    ) {
      slice.warnings[SLICE_WARNING_OUTSIDE] = true
    } else {
      slice.warnings[SLICE_WARNING_OUTSIDE] = false
    }

    // Apply a warning if slice width is less than the minimum width
    // defined for this slice type.
    if (
      variantInfo.minWidth !== undefined &&
      slice.width < getWidthInMetric(variantInfo.minWidth, street.units)
    ) {
      slice.warnings[SLICE_WARNING_WIDTH_TOO_SMALL] = true
    } else {
      slice.warnings[SLICE_WARNING_WIDTH_TOO_SMALL] = false
    }

    // Apply a warning if slice width is greater than the maximum width
    // defined for this slice type.
    if (
      variantInfo.maxWidth &&
      slice.width > getWidthInMetric(variantInfo.maxWidth, street.units)
    ) {
      slice.warnings[SLICE_WARNING_WIDTH_TOO_LARGE] = true
    } else {
      slice.warnings[SLICE_WARNING_WIDTH_TOO_LARGE] = false
    }

    // Apply a warning if the slice type and variant is the mixed-use
    // drive lane with bicycle, which is a dangerous existing condition
    if (variantInfo.dangerous === true) {
      slice.warnings[SLICE_WARNING_DANGEROUS_EXISTING] = true
    } else {
      slice.warnings[SLICE_WARNING_DANGEROUS_EXISTING] = false
    }

    // Apply a warning for slope
    if (slice.slope.on) {
      const { ratio } = getRiseRunValues(slice.slope.values, slice.width)
      const slopeWarnings = getSlopeWarnings(ratio)
      if (variantInfo.slope === 'berm' && slopeWarnings.slopeExceededBerm) {
        slice.warnings[SLICE_WARNING_SLOPE_EXCEEDED_BERM] = true
        // The idea is that if you've exceeded the slope for berm you've also
        // exceeded the slope for path
        slice.warnings[SLICE_WARNING_SLOPE_EXCEEDED_PATH] = true
      } else if (
        variantInfo.slope === 'path' &&
        slopeWarnings.slopeExceededPath
      ) {
        slice.warnings[SLICE_WARNING_SLOPE_EXCEEDED_BERM] = false
        slice.warnings[SLICE_WARNING_SLOPE_EXCEEDED_PATH] = true
      } else {
        slice.warnings[SLICE_WARNING_SLOPE_EXCEEDED_BERM] = false
        slice.warnings[SLICE_WARNING_SLOPE_EXCEEDED_PATH] = false
      }
    }

    // Increment the position counter
    position = position.add(slice.width)
  })

  return slices
}
