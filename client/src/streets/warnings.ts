import { getSegmentVariantInfo } from '@streetmix/parts'
import { getWidthInMetric } from '@streetmix/utils'

import { getRiseRunValues, getSlopeWarnings } from '../segments/slope.js'

import type { SliceItem, SliceWarnings, StreetJson } from '@streetmix/types'
import type { CalculatedWidths } from './width.js'

export function applyWarningsToSlices(
  slices: SliceItem[], // This is a copy we can edit
  street: StreetJson, // This is original street data that we need
  calculatedWidths: CalculatedWidths
) {
  const { streetWidth, occupiedWidth, remainingWidth } = calculatedWidths

  const warnings: Record<string, Partial<SliceWarnings>> = {}

  // The position is the left pixel position of each segment. This is initialized
  // with the left pixel of the first segment and will be modified when looking at
  // each subsequent segment.
  let position = streetWidth.dividedBy(2).minus(occupiedWidth.dividedBy(2))

  slices.forEach((slice: SliceItem) => {
    const variantInfo = getSegmentVariantInfo(slice.type, slice.variantString)
    const id = slice.id

    if (!warnings[id]) {
      warnings[id] = {}
    }

    // Apply a warning if any portion of the slice exceeds the boundaries of
    // the street.
    if (
      remainingWidth.abs().gt(0) &&
      (position.lessThan(0) ||
        position.plus(slice.width).greaterThan(streetWidth))
    ) {
      warnings[id].outOfBounds = true
    }

    // Apply a warning if slice width is less than the minimum width
    // defined for this slice type.
    if (
      variantInfo.minWidth !== undefined &&
      slice.width < getWidthInMetric(variantInfo.minWidth, street.units)
    ) {
      warnings[id].tooNarrow = true
    }

    // Apply a warning if slice width is greater than the maximum width
    // defined for this slice type.
    if (
      variantInfo.maxWidth &&
      slice.width > getWidthInMetric(variantInfo.maxWidth, street.units)
    ) {
      warnings[id].tooWide = true
    }

    // Apply a warning if the slice type and variant is the mixed-use
    // drive lane with bicycle, which is a dangerous existing condition
    if (variantInfo.dangerous === true) {
      warnings[id].dangerousExisting = true
    }

    // Apply a warning for slope
    if (slice.slope.on) {
      const { ratio } = getRiseRunValues(slice.slope.values, slice.width)
      const slopeWarnings = getSlopeWarnings(ratio)
      if (variantInfo.slope === 'berm' && slopeWarnings.slopeExceededBerm) {
        warnings[id].slopeBermExceeded = true
        // The idea is that if you've exceeded the slope for berm you've also
        // exceeded the slope for path
        warnings[id].slopePathExceeded = true
      } else if (
        variantInfo.slope === 'path' &&
        slopeWarnings.slopeExceededPath
      ) {
        warnings[id].slopePathExceeded = true
      }
    }

    // Increment the position counter
    position = position.add(slice.width)
  })

  return warnings
}
