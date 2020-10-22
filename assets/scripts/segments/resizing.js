import { infoBubble } from '../info_bubble/info_bubble'
import { INFO_BUBBLE_TYPE_SEGMENT } from '../info_bubble/constants'
import { setIgnoreStreetChanges } from '../streets/data_model'
import { draggingResize } from './drag_and_drop'
import { segmentsChanged } from './view'
import {
  TILE_SIZE,
  MIN_SEGMENT_WIDTH,
  MAX_SEGMENT_WIDTH,
  DRAGGING_TYPE_NONE,
  SEGMENT_WIDTH_RESOLUTION_IMPERIAL,
  SEGMENT_WIDTH_CLICK_INCREMENT_IMPERIAL,
  SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL,
  SEGMENT_WIDTH_RESOLUTION_METRIC,
  SEGMENT_WIDTH_CLICK_INCREMENT_METRIC,
  SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC,
  BUILDING_SPACE
} from './constants'
import { SETTINGS_UNITS_IMPERIAL } from '../users/constants'
import store from '../store'
import { changeSegmentWidth } from '../store/slices/street'
import { setDraggingType } from '../store/slices/ui'

const SHORT_DELAY = 100

export const RESIZE_TYPE_INITIAL = 0
export const RESIZE_TYPE_INCREMENT = 1
export const RESIZE_TYPE_DRAGGING = 2
export const RESIZE_TYPE_PRECISE_DRAGGING = 3
export const RESIZE_TYPE_TYPING = 4

const NORMALIZE_PRECISION = 5

export function resizeSegment (dataNo, resizeType, width, units) {
  // @TODO: don't read state for units; this is a temp kludge because the drag resizing
  // handler doesn't currently have access to the units. So if it's not provided, grab it
  // from state
  const resolution = resolutionForResizeType(
    resizeType,
    units || store.getState().street.units
  )
  width = normalizeSegmentWidth(width, resolution)
  cancelSegmentResizeTransitions()
  store.dispatch(changeSegmentWidth(dataNo, width))
  segmentsChanged()
  return width
}

export function handleSegmentResizeCancel () {
  resizeSegment(
    draggingResize.segmentEl.dataNo,
    RESIZE_TYPE_INITIAL,
    draggingResize.originalWidth
  )

  handleSegmentResizeEnd()
}

/**
 * Updates street section canvas margins when occupiedWidth is greater than default street extent
 *
 * The default street extent is equal to the street width + (2 * BUILDING_SPACE). When the occupiedWidth
 * is greater than the default street extent, the street-section-outer's scrollLeft no longer works properly.
 *
 * The solution to the above problem, is to update the street-section-canvas' margins and the building widths
 * based on how much the occupiedWidth extends greater than the street width and the default street extent.
 *
 * This function calculates the street margin based on the remainingWidth and compares it to the previous
 * street margin. If the previous street margin is not equal to the current street margin, it will update
 * street-section-canvas' margins accordingly (except in specific situations described within the function)
 *
 */
export function updateStreetMargin (
  canvasRef,
  streetOuterRef,
  dontDelay = false
) {
  const streetSectionCanvas =
    canvasRef || document.querySelector('#street-section-canvas')
  const streetSectionOuter =
    streetOuterRef || document.querySelector('#street-section-outer')

  const prevMargin =
    Number.parseInt(streetSectionCanvas.style.marginLeft, 10) || BUILDING_SPACE
  const { remainingWidth } = store.getState().street
  let streetMargin = Math.round((-remainingWidth * TILE_SIZE) / 2)

  if (!streetMargin || streetMargin < BUILDING_SPACE) {
    streetMargin = BUILDING_SPACE
  }

  const deltaMargin = streetMargin - prevMargin

  if (!deltaMargin) return false

  const maxScrollLeft =
    streetSectionOuter.scrollWidth - streetSectionOuter.clientWidth

  // When scrolled all the way to right and decreasing occupiedWidth, an empty strip
  // of space is shown briefly before being scrolled if updating streetMargin.
  // When scrolled all the way to left and decreasing occupiedWidth, cannot update
  // scrollLeft to keep current segments in view (scrollLeft = 0)
  // Current solution is to delay updating margin until street is not scrolled all
  // the way to right or all the way to left or viewport was resized.
  const delayUpdate =
    !dontDelay &&
    deltaMargin < 0 &&
    (Math.abs(deltaMargin) > streetSectionOuter.scrollLeft ||
      streetSectionOuter.scrollLeft === maxScrollLeft)

  if (!delayUpdate) {
    streetSectionCanvas.style.marginLeft = streetMargin + 25 + 'px'
    streetSectionCanvas.style.marginRight = streetMargin + 25 + 'px'
  }

  return !delayUpdate
}

export function handleSegmentResizeEnd (event) {
  setIgnoreStreetChanges(false)

  updateStreetMargin()
  segmentsChanged()

  store.dispatch(setDraggingType(DRAGGING_TYPE_NONE))

  var el = draggingResize.floatingEl
  el.remove()

  draggingResize.segmentEl.classList.add('immediate-show-drag-handles')

  infoBubble.considerSegmentEl = draggingResize.segmentEl
  infoBubble.show(false)

  infoBubble.considerShowing(
    event,
    draggingResize.segmentEl,
    INFO_BUBBLE_TYPE_SEGMENT
  )
}

/**
 * Returns the minimum resolution for segment / street widths.
 * Default return value is in metric units.
 *
 * @param {*} units - metric or imperial
 * @param {Number}
 */
export function getSegmentWidthResolution (units) {
  if (units === SETTINGS_UNITS_IMPERIAL) {
    return SEGMENT_WIDTH_RESOLUTION_IMPERIAL
  }

  return SEGMENT_WIDTH_RESOLUTION_METRIC
}

/**
 * Returns the minimum resolution when click-resizing segments
 * Default return value is in metric units.
 *
 * @param {*} units - metric or imperial
 * @param {Number}
 */
export function getSegmentClickResizeResolution (units) {
  if (units === SETTINGS_UNITS_IMPERIAL) {
    return SEGMENT_WIDTH_CLICK_INCREMENT_IMPERIAL
  }

  return SEGMENT_WIDTH_CLICK_INCREMENT_METRIC
}

/**
 * Returns the minimum resolution when drag-resizing segments
 * Default return value is in metric units.
 *
 * @param {Number} units - metric or imperial
 * @param {Number}
 */
export function getSegmentDragResizeResolution (units) {
  if (units === SETTINGS_UNITS_IMPERIAL) {
    return SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL
  }

  return SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC
}

/**
 * Resolution is the precision at which measurements are rounded to,
 * in order to avoid awkward decimals. There are different levels
 * of precision depending on what action is performed. The resolution
 * is also different depending on whether the street is measured in
 * metric or imperial units. This function returns the minimum resolution
 * depending on the type of resize action and the measurement units.
 *
 * @param {Number} resizeType
 * @param {Number} units - metric or imperial
 * @returns {Number}
 */
export function resolutionForResizeType (resizeType, units) {
  switch (resizeType) {
    case RESIZE_TYPE_INITIAL:
    case RESIZE_TYPE_TYPING:
    case RESIZE_TYPE_PRECISE_DRAGGING:
    default:
      // Always return this resolution if `resizeType` is undefined or wrong value
      return getSegmentWidthResolution(units)
    case RESIZE_TYPE_INCREMENT:
      return getSegmentClickResizeResolution(units)
    case RESIZE_TYPE_DRAGGING:
      return getSegmentDragResizeResolution(units)
  }
}

/**
 * Given an input width value, constrains the value to the
 * minimum or maximum value, then rounds it to nearest precision
 *
 * @param {Number} width - input width value
 * @param {Number} resolution - resolution to round to
 * @returns {Number}
 */
export function normalizeSegmentWidth (width, resolution) {
  if (width < MIN_SEGMENT_WIDTH) {
    width = MIN_SEGMENT_WIDTH
  } else if (width > MAX_SEGMENT_WIDTH) {
    width = MAX_SEGMENT_WIDTH
  }
  width = Math.round(width / resolution) * resolution
  width = Number.parseFloat(width.toFixed(NORMALIZE_PRECISION))
  return width
}

/**
 * Performs `normalizeSegmentWidth` on an array of segments and
 * returns the new array.
 *
 * @param {Array} segments
 * @param {Number} units - metric or imperial units
 * @returns {Array}
 */
export function normalizeAllSegmentWidths (segments, units) {
  return segments.map((segment) => ({
    ...segment,
    width: normalizeSegmentWidth(
      segment.width,
      resolutionForResizeType(RESIZE_TYPE_INITIAL, units)
    )
  }))
}

export function hideControls () {
  if (infoBubble.segmentEl) {
    infoBubble.segmentEl.classList.remove('show-drag-handles')

    window.setTimeout(function () {
      infoBubble.hide()
      infoBubble.hideSegment(true)
    }, 0)
  }
}

export function cancelSegmentResizeTransitions () {
  document.body.classList.add('immediate-segment-resize')
  window.setTimeout(function () {
    document.body.classList.remove('immediate-segment-resize')
  }, SHORT_DELAY)
}
