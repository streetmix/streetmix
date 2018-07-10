import { onResize } from '../app/window_resize'
import { system } from '../preinit/system_capabilities'
import { BUILDING_SPACE } from '../segments/buildings'
import { getSegmentVariantInfo } from '../segments/info'
import {
  TILE_SIZE,
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL,
  SEGMENT_WARNING_WIDTH_TOO_LARGE
} from '../segments/constants'
import store from '../store'

export const DEFAULT_STREET_WIDTH = 80

const MIN_CUSTOM_STREET_WIDTH = 10
export const MAX_CUSTOM_STREET_WIDTH = 400

const WIDTH_ROUNDING = 0.01

export function resizeStreetWidth (dontScroll) {
  var width = store.getState().street.width * TILE_SIZE

  document.querySelector('#street-section-canvas').style.width = width + 'px'
  if (!dontScroll) {
    document.querySelector('#street-section-outer').scrollLeft =
      (width + (BUILDING_SPACE * 2) - system.viewportWidth) / 2
  }

  onResize()
}

export function normalizeStreetWidth (width) {
  const { resolution } = store.getState().ui.unitSettings

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
 *
 * @param {Array} segments
 * @returns {Number} occupiedWidth
 */
function calculateOccupiedWidth (segments) {
  return segments
    .map((segment) => segment.width)
    .reduce((occupiedWidth, width) => occupiedWidth + width, 0)
}

/**
 * Subtracts occupied width from street width to get remaining width.
 * Value returned should not dip below zero.
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
 * @returns {Object} street (modified)
 */
export function recalculateWidth (street) {
  const segments = street.segments || []

  // Determine occupied and remaining width
  street.occupiedWidth = calculateOccupiedWidth(segments)
  street.remainingWidth = calculateRemainingWidth(street.width, street.occupiedWidth)

  // Add warnings to segments, if necessary.
  // The position is the left pixel position of each segment. This is initialized
  // with the left pixel of the first segment and will be modified when looking at
  // each subsequent segment.
  let position = (street.width / 2) - (street.occupiedWidth / 2)

  segments.forEach((segment) => {
    const variantInfo = getSegmentVariantInfo(segment.type, segment.variantString)

    // If any portion of the segment will be outside the street width,
    // apply a warning that the segment is outside the street.
    if ((street.remainingWidth < 0) && ((position < 0) || ((position + segment.width) > street.width))) {
      segment.warnings[SEGMENT_WARNING_OUTSIDE] = true
    } else {
      segment.warnings[SEGMENT_WARNING_OUTSIDE] = false
    }

    // If segment width is less than the minimum width set for the segment type,
    // apply a warning.
    if (variantInfo.minWidth && (segment.width < variantInfo.minWidth)) {
      segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = true
    } else {
      segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = false
    }

    // If segment width is greater than the maximum width set for the segment type,
    // apply a warning.
    if (variantInfo.maxWidth && (segment.width > variantInfo.maxWidth)) {
      segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = true
    } else {
      segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = false
    }

    // Increment the position counter.
    position += segment.width
  })

  return street
}
