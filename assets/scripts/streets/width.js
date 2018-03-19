import { onResize } from '../app/window_resize'
import { system } from '../preinit/system_capabilities'
import { BUILDING_SPACE, createBuildings } from '../segments/buildings'
import { getSegmentVariantInfo } from '../segments/info'
import { getSegmentWidthResolution } from '../segments/resizing'
import { TILE_SIZE } from '../segments/view'
import store from '../store'
import { updateStreetData } from '../store/actions/street'

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
  if (width < MIN_CUSTOM_STREET_WIDTH) {
    width = MIN_CUSTOM_STREET_WIDTH
  } else if (width > MAX_CUSTOM_STREET_WIDTH) {
    width = MAX_CUSTOM_STREET_WIDTH
  }

  var resolution = getSegmentWidthResolution()
  width = Math.round(width / resolution) * resolution

  return width
}

export function recalculateOccupiedWidth () {
  const street = store.getState().street
  street.occupiedWidth = 0

  for (var i in street.segments) {
    var segment = street.segments[i]

    street.occupiedWidth += segment.width
  }

  street.remainingWidth = street.width - street.occupiedWidth
  // Rounding problems :·(
  if (Math.abs(street.remainingWidth) < WIDTH_ROUNDING) {
    street.remainingWidth = 0
  }
  store.dispatch(updateStreetData(street))
  // updateStreetMetadata(street)
}

export function recalculateWidth () {
  recalculateOccupiedWidth()

  const street = store.getState().street
  var position = (street.width / 2) - (street.occupiedWidth / 2)

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

    position += street.segments[i].width
  }

  store.dispatch(updateStreetData(street))

  var lastOverflow = document.body.classList.contains('street-overflows')

  if (street.remainingWidth >= 0) {
    document.body.classList.remove('street-overflows')
  } else {
    document.body.classList.add('street-overflows')
  }

  if (lastOverflow !== document.body.classList.contains('street-overflows')) {
    createBuildings()
  }
}
