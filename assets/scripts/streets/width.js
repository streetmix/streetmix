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
import { updateOccupiedWidth, updateSegments } from '../store/actions/street'

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
 * @param {Object} street
 */
function calculateOccupiedWidth (street) {
  return street.segments
    .map((segment) => segment.width)
    .reduce((occupiedWidth, width) => occupiedWidth + width, 0)
}

/**
 * Subtracts occupied width from street width to get remaining width.
 * Value returned should not dip below zero.
 *
 * @param {Object} street
 * @param {Number} occupiedWidth
 */
function calculateRemainingWidth (street, occupiedWidth) {
  let remainingWidth = street.width - occupiedWidth

  // Rounding problems :·(
  if (Math.abs(remainingWidth) < WIDTH_ROUNDING) {
    remainingWidth = 0
  }

  return remainingWidth
}

export function recalculateWidth () {
  const street = store.getState().street

  const occupiedWidth = calculateOccupiedWidth(street)
  const remainingWidth = calculateRemainingWidth(street, occupiedWidth)
  store.dispatch(updateOccupiedWidth(occupiedWidth, remainingWidth))

  let position = (street.width / 2) - (street.occupiedWidth / 2)

  const segments = []
  for (let i in street.segments) {
    const segment = street.segments[i]
    const variantInfo = getSegmentVariantInfo(segment.type, segment.variantString)

    if (segment.el) {
      if ((street.remainingWidth < 0) && ((position < 0) || ((position + segment.width) > street.width))) {
        segment.warnings[SEGMENT_WARNING_OUTSIDE] = true
      } else {
        segment.warnings[SEGMENT_WARNING_OUTSIDE] = false
      }

      if (variantInfo.minWidth && (segment.width < variantInfo.minWidth)) {
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = true
      } else {
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = false
      }

      if (variantInfo.maxWidth && (segment.width > variantInfo.maxWidth)) {
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = true
      } else {
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = false
      }
    }

    segments.push(segment)

    position += street.segments[i].width
  }

  store.dispatch(updateSegments(segments))
}
