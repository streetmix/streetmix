import {
  SETTINGS_UNITS_IMPERIAL,
  SEGMENT_WIDTH_RESOLUTION_IMPERIAL,
  SEGMENT_WIDTH_CLICK_INCREMENT_IMPERIAL,
  SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL,
  SEGMENT_WIDTH_RESOLUTION_METRIC,
  SEGMENT_WIDTH_CLICK_INCREMENT_METRIC,
  SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC
} from '../users/constants'

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
 * @param {*} units - metric or imperial
 * @param {Number}
 */
export function getSegmentDragResizeResolution (units) {
  if (units === SETTINGS_UNITS_IMPERIAL) {
    return SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL
  }

  return SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC
}
