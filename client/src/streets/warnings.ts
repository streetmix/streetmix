import {
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL,
  SEGMENT_WARNING_WIDTH_TOO_LARGE,
  SEGMENT_WARNING_DANGEROUS_EXISTING,
  SEGMENT_WARNING_SLOPE_EXCEEDED
} from '../segments/constants'
import { getSegmentVariantInfo } from '../segments/info'
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
      warnings[SEGMENT_WARNING_OUTSIDE] = true
    } else {
      warnings[SEGMENT_WARNING_OUTSIDE] = false
    }

    // Apply a warning if segment width is less than the minimum width
    // defined for this segment type.
    if (
      variantInfo.minWidth !== undefined &&
      segment.width < getWidthInMetric(variantInfo.minWidth, street.units)
    ) {
      warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = true
    } else {
      warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = false
    }

    // Apply a warning if segment width is greater than the maximum width
    // defined for this segment type.
    if (
      variantInfo.maxWidth &&
      segment.width > getWidthInMetric(variantInfo.maxWidth, street.units)
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

    // Apply a warning for slope
    warnings[SEGMENT_WARNING_SLOPE_EXCEEDED] = false // default value
    if (segment.slope) {
      const leftElevation = street.segments[index - 1]?.elevation ?? 0
      const rightElevation = street.segments[index + 1]?.elevation ?? 0
      const rise = Math.abs(leftElevation - rightElevation)
      const ratio = Number((segment.width / rise).toFixed(2))
      if (ratio < 3) {
        warnings[SEGMENT_WARNING_SLOPE_EXCEEDED] = true
      }
    }

    // Increment the position counter.
    position = position.add(segment.width)

    segments.push({
      ...segment,
      warnings
    })
  })

  return segments
}
