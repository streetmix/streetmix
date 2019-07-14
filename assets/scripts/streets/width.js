import {
  MIN_CUSTOM_STREET_WIDTH,
  MAX_CUSTOM_STREET_WIDTH,
  WIDTH_ROUNDING
} from './constants'
import {
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL,
  SEGMENT_WARNING_WIDTH_TOO_LARGE
} from '../segments/constants'
import { getSegmentVariantInfo } from '../segments/info'
import { getSegmentWidthResolution } from '../segments/resizing'

/**
 * Given an input width value, constrains the value to the
 * minimum or maximum value, then rounds it to nearest precision
 *
 * @param {Number} width - input width value
 * @param {Number} units - metric or imperial
 * @returns {Number}
 */
export function normalizeStreetWidth (width, units) {
  const resolution = getSegmentWidthResolution(units)

  if (width < MIN_CUSTOM_STREET_WIDTH) {
    width = MIN_CUSTOM_STREET_WIDTH
  } else if (width > MAX_CUSTOM_STREET_WIDTH) {
    width = MAX_CUSTOM_STREET_WIDTH
  }

  width = Math.round(width / resolution) * resolution

  return width
}

/**
 * Adds up all the segment widths to get the total occupied width
 * An empty array should return 0
 *
 * @param {Array} segments
 * @returns {Number} occupiedWidth
 */
function calculateOccupiedWidth (segments = []) {
  return segments
    .map((segment) => segment.width)
    .reduce((occupiedWidth, width) => occupiedWidth + width, 0)
}

/**
 * Subtracts occupied width from street width to get remaining width.
 *
 * @param {Number} streetWidth
 * @param {Number} occupiedWidth
 * @returns {Number} remainingWidth
 */
function calculateRemainingWidth (streetWidth, occupiedWidth) {
  let remainingWidth = streetWidth - occupiedWidth

  // Rounding problems :·(
  if (Math.abs(remainingWidth) < WIDTH_ROUNDING) {
    remainingWidth = 0
  }

  return remainingWidth
}

/**
 * Given a street data object, calculate and store the following values:
 *    - How much of the street is occupied by segments, if any
 *    - The remaining width not occupied, if any
 *    - Warnings for each segment, if the segment is outside the
 *      street or is too small or too large.
 *
 * @param {Object} street
 * @returns {Object} containing calculated occupied width, remaining width,
 *       and clone of segments array with warnings.
 */
export function recalculateWidth (street) {
  // Determine occupied and remaining width
  const occupiedWidth = calculateOccupiedWidth(street.segments)
  const remainingWidth = calculateRemainingWidth(street.width, occupiedWidth)

  // Add warnings to segments, if necessary.
  // The position is the left pixel position of each segment. This is initialized
  // with the left pixel of the first segment and will be modified when looking at
  // each subsequent segment.
  let position = (street.width / 2) - (occupiedWidth / 2)

  // Creates an empty array so that we can clone original segments into it.
  const segments = []

  street.segments.forEach((segment) => {
    const variantInfo = getSegmentVariantInfo(segment.type, segment.variantString)
    const warnings = []

    // If any portion of the segment will be outside the street width,
    // apply a warning that the segment is outside the street.
    if ((remainingWidth < 0) && ((position < 0) || ((position + segment.width) > street.width))) {
      warnings[SEGMENT_WARNING_OUTSIDE] = true
    } else {
      warnings[SEGMENT_WARNING_OUTSIDE] = false
    }

    // If segment width is less than the minimum width set for the segment type,
    // apply a warning.
    if (variantInfo.minWidth && (segment.width < variantInfo.minWidth)) {
      warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = true
    } else {
      warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = false
    }

    // If segment width is greater than the maximum width set for the segment type,
    // apply a warning.
    if (variantInfo.maxWidth && (segment.width > variantInfo.maxWidth)) {
      warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = true
    } else {
      warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = false
    }

    // Increment the position counter.
    position += segment.width

    segments.push({
      ...segment,
      warnings
    })
  })

  return {
    occupiedWidth,
    remainingWidth,
    segments
  }
}
