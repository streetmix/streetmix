import { onResize } from '../app/window_resize'
import { system } from '../preinit/system_capabilities'
import { BUILDING_SPACE } from '../segments/buildings'
import { getSegmentVariantInfo } from '../segments/info'
import { TILE_SIZE } from '../segments/constants'
import store from '../store'
import { updateOccupiedWidth, updateSegments } from '../store/actions/street'

export const DEFAULT_STREET_WIDTH = 80

const MIN_CUSTOM_STREET_WIDTH = 10
export const MAX_CUSTOM_STREET_WIDTH = 400

const WIDTH_ROUNDING = 0.01

export const SEGMENT_WARNING_OUTSIDE = 1
export const SEGMENT_WARNING_WIDTH_TOO_SMALL = 2
export const SEGMENT_WARNING_WIDTH_TOO_LARGE = 3

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
  const { resolution } = store.getState().street.unitSettings

  if (width < MIN_CUSTOM_STREET_WIDTH) {
    width = MIN_CUSTOM_STREET_WIDTH
  } else if (width > MAX_CUSTOM_STREET_WIDTH) {
    width = MAX_CUSTOM_STREET_WIDTH
  }

  width = Math.round(width / resolution) * resolution

  return width
}

export function recalculateOccupiedWidth () {
  const street = store.getState().street
  let occupiedWidth = 0

  for (var i in street.segments) {
    let segment = street.segments[i]

    occupiedWidth += segment.width
  }

  let remainingWidth = street.width - occupiedWidth
  // Rounding problems :·(
  if (Math.abs(remainingWidth) < WIDTH_ROUNDING) {
    remainingWidth = 0
  }
  store.dispatch(updateOccupiedWidth(occupiedWidth, remainingWidth))
  // updateStreetMetadata(street)
}

export function recalculateWidth () {
  recalculateOccupiedWidth()

  const street = store.getState().street
  var position = (street.width / 2) - (street.occupiedWidth / 2)

  const segments = []
  for (var i in street.segments) {
    var segment = street.segments[i]
    const variantInfo = getSegmentVariantInfo(segment.type, segment.variantString)

    if (segment.el) {
      if ((street.remainingWidth < 0) &&
        ((position < 0) || ((position + segment.width) > street.width))) {
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
