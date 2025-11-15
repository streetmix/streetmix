import {
  SLICE_WARNING_OUTSIDE,
  SLICE_WARNING_WIDTH_TOO_SMALL,
  SLICE_WARNING_WIDTH_TOO_LARGE,
  SLICE_WARNING_DANGEROUS_EXISTING,
  SLICE_WARNING_SLOPE_EXCEEDED_BERM,
  SLICE_WARNING_SLOPE_EXCEEDED_PATH
} from '../segments/constants'
import { getSegmentVariantInfo } from '../segments/info'
import { calculateSlope } from '../segments/slope'
import { getWidthInMetric } from '../util/width_units'

import type { Segment, StreetJson } from '@streetmix/types'
import type { CalculatedWidths } from './width'

/**
 * Applies warnings to slices, if necessary.
 */
export function applyWarningsToSlices (
  street: StreetJson,
  calculatedWidths: CalculatedWidths
): Segment[] {
  const { streetWidth, occupiedWidth, remainingWidth } = calculatedWidths

  // The position is the left pixel position of each segment. This is initialized
  // with the left pixel of the first segment and will be modified when looking at
  // each subsequent segment.
  let position = streetWidth.dividedBy(2).minus(occupiedWidth.dividedBy(2))

  // Creates an empty array so that we can clone original segments into it.
  const segments: Segment[] = []

  street.segments.forEach((segment: Segment, index: number) => {
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
      warnings[SLICE_WARNING_OUTSIDE] = true
    } else {
      warnings[SLICE_WARNING_OUTSIDE] = false
    }

    // Apply a warning if segment width is less than the minimum width
    // defined for this segment type.
    if (
      variantInfo.minWidth !== undefined &&
      segment.width < getWidthInMetric(variantInfo.minWidth, street.units)
    ) {
      warnings[SLICE_WARNING_WIDTH_TOO_SMALL] = true
    } else {
      warnings[SLICE_WARNING_WIDTH_TOO_SMALL] = false
    }

    // Apply a warning if segment width is greater than the maximum width
    // defined for this segment type.
    if (
      variantInfo.maxWidth &&
      segment.width > getWidthInMetric(variantInfo.maxWidth, street.units)
    ) {
      warnings[SLICE_WARNING_WIDTH_TOO_LARGE] = true
    } else {
      warnings[SLICE_WARNING_WIDTH_TOO_LARGE] = false
    }

    // Apply a warning if the segment type and variant is the mixed-use
    // drive lane with bicycle, which is a dangerous existing condition
    if (variantInfo.dangerous === true) {
      warnings[SLICE_WARNING_DANGEROUS_EXISTING] = true
    } else {
      warnings[SLICE_WARNING_DANGEROUS_EXISTING] = false
    }

    // Apply a warning for slope
    const slopes = calculateSlope(street, index)
    if (slopes?.warnings.slopeExceededBerm) {
      warnings[SLICE_WARNING_SLOPE_EXCEEDED_BERM] = true
    } else {
      warnings[SLICE_WARNING_SLOPE_EXCEEDED_BERM] = false
    }
    if (slopes?.warnings.slopeExceededPath) {
      warnings[SLICE_WARNING_SLOPE_EXCEEDED_PATH] = true
    } else {
      warnings[SLICE_WARNING_SLOPE_EXCEEDED_PATH] = false
    }

    // Increment the position counter
    position = position.add(segment.width)

    segments.push({
      ...segment,
      warnings
    })
  })

  return segments
}
