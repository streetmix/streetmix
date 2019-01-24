import { trackEvent } from '../app/event_tracking'
import { infoBubble } from '../info_bubble/info_bubble'
import { INFO_BUBBLE_TYPE_SEGMENT } from '../info_bubble/constants'
import { setIgnoreStreetChanges } from '../streets/data_model'
import {
  DRAGGING_TYPE_NONE,
  draggingResize,
  changeDraggingType
} from './drag_and_drop'
import { segmentsChanged } from './view'
import { BUILDING_SPACE } from './buildings'
import {
  TILE_SIZE,
  MIN_SEGMENT_WIDTH,
  MAX_SEGMENT_WIDTH
} from './constants'
import store from '../store'
import { updateSegments, changeSegmentWidth } from '../store/actions/street'
import { updateResizeDragState } from '../store/actions/ui'

const SHORT_DELAY = 100

export const RESIZE_TYPE_INITIAL = 0
const RESIZE_TYPE_INCREMENT = 1
export const RESIZE_TYPE_DRAGGING = 2
export const RESIZE_TYPE_PRECISE_DRAGGING = 3
export const RESIZE_TYPE_TYPING = 4

const TOUCH_CONTROLS_FADEOUT_TIME = 3000
const TOUCH_CONTROLS_FADEOUT_DELAY = 3000

const NORMALIZE_PRECISION = 5

let _suppressMouseEnter = false

export function suppressMouseEnter () {
  return _suppressMouseEnter
}

export function resizeSegment (dataNo, resizeType, width) {
  width = normalizeSegmentWidth(width, resizeType)
  cancelSegmentResizeTransitions()
  store.dispatch(changeSegmentWidth(dataNo, width))
  segmentsChanged()
  return width
}

export function handleSegmentResizeCancel () {
  resizeSegment(draggingResize.segmentEl.dataNo, RESIZE_TYPE_INITIAL, draggingResize.originalWidth)

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
export function updateStreetMargin (canvasRef, streetOuterRef, dontDelay = false) {
  const streetSectionCanvas = canvasRef || document.querySelector('#street-section-canvas')
  const streetSectionOuter = streetOuterRef || document.querySelector('#street-section-outer')

  const prevMargin = Number.parseInt(streetSectionCanvas.style.marginLeft, 10) || BUILDING_SPACE
  const { remainingWidth } = store.getState().street
  let streetMargin = Math.round(-remainingWidth * TILE_SIZE / 2)

  if (!streetMargin || streetMargin < BUILDING_SPACE) {
    streetMargin = BUILDING_SPACE
  }

  const deltaMargin = (streetMargin - prevMargin)

  if (!deltaMargin) return false

  const maxScrollLeft = streetSectionOuter.scrollWidth - streetSectionOuter.clientWidth

  // When scrolled all the way to right and decreasing occupiedWidth, an empty strip
  // of space is shown briefly before being scrolled if updating streetMargin.
  // When scrolled all the way to left and decreasing occupiedWidth, cannot update
  // scrollLeft to keep current segments in view (scrollLeft = 0)
  // Current solution is to delay updating margin until street is not scrolled all
  // the way to right or all the way to left or viewport was resized.
  const delayUpdate = (!dontDelay && deltaMargin < 0 && (Math.abs(deltaMargin) > streetSectionOuter.scrollLeft ||
    streetSectionOuter.scrollLeft === maxScrollLeft))

  if (!delayUpdate) {
    streetSectionCanvas.style.marginLeft = (streetMargin + 25) + 'px'
    streetSectionCanvas.style.marginRight = (streetMargin + 25) + 'px'
  }

  return (!delayUpdate)
}

export function handleSegmentResizeEnd (event) {
  setIgnoreStreetChanges(false)

  updateStreetMargin()
  segmentsChanged()

  changeDraggingType(DRAGGING_TYPE_NONE)

  var el = draggingResize.floatingEl
  el.remove()

  draggingResize.segmentEl.classList.add('immediate-show-drag-handles')

  store.dispatch(updateResizeDragState(false))

  infoBubble.considerSegmentEl = draggingResize.segmentEl
  infoBubble.show(false)

  scheduleControlsFadeout(draggingResize.segmentEl)

  _suppressMouseEnter = true
  infoBubble.considerShowing(event, draggingResize.segmentEl, INFO_BUBBLE_TYPE_SEGMENT)
  window.setTimeout(function () {
    _suppressMouseEnter = false
  }, 50)

  if (draggingResize.width && (draggingResize.originalWidth !== draggingResize.width)) {
    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'DRAGGING', null, true)
  }
}

export function normalizeAllSegmentWidths () {
  const street = store.getState().street
  const segments = []
  for (var i in street.segments) {
    const segment = street.segments[i]
    segment.width = normalizeSegmentWidth(segment.width, RESIZE_TYPE_INITIAL)
    segments.push(segment)
  }
  store.dispatch(updateSegments(segments))
}

export function normalizeSegmentWidth (width, resizeType) {
  const { unitSettings } = store.getState().ui
  let resolution
  if (width < MIN_SEGMENT_WIDTH) {
    width = MIN_SEGMENT_WIDTH
  } else if (width > MAX_SEGMENT_WIDTH) {
    width = MAX_SEGMENT_WIDTH
  }

  switch (resizeType) {
    case RESIZE_TYPE_INITIAL:
    case RESIZE_TYPE_TYPING:
    case RESIZE_TYPE_INCREMENT:
    case RESIZE_TYPE_PRECISE_DRAGGING:
      resolution = unitSettings.resolution
      break
    case RESIZE_TYPE_DRAGGING:
      resolution = unitSettings.draggingResolution
      break
  }

  width = Math.round(width / resolution) * resolution
  width = Number.parseFloat(width.toFixed(NORMALIZE_PRECISION))

  return width
}

// temp: add origWidth as 4th arg to pass in value from redux
export function incrementSegmentWidth (dataNo, add, precise, origWidth) {
  const { unitSettings } = store.getState().ui
  let increment

  if (precise) {
    increment = unitSettings.resolution
  } else {
    increment = unitSettings.clickIncrement
  }

  if (!add) {
    increment = -increment
  }

  const width = normalizeSegmentWidth(origWidth + increment, RESIZE_TYPE_INCREMENT)

  resizeSegment(dataNo, RESIZE_TYPE_INCREMENT, width)

  return width
}

let controlsFadeoutDelayTimer = -1
let controlsFadeoutHideTimer = -1

function scheduleControlsFadeout (el) {
  infoBubble.considerShowing(null, el, INFO_BUBBLE_TYPE_SEGMENT)

  resumeFadeoutControls()
}

export function resumeFadeoutControls () {
  const system = store.getState().system

  if (!system.touch) {
    return
  }

  cancelFadeoutControls()

  controlsFadeoutDelayTimer = window.setTimeout(fadeoutControls, TOUCH_CONTROLS_FADEOUT_DELAY)
}

export function cancelFadeoutControls () {
  document.body.classList.remove('controls-fade-out')
  window.clearTimeout(controlsFadeoutDelayTimer)
  window.clearTimeout(controlsFadeoutHideTimer)
}

function fadeoutControls () {
  document.body.classList.add('controls-fade-out')

  controlsFadeoutHideTimer = window.setTimeout(hideControls, TOUCH_CONTROLS_FADEOUT_TIME)
}

export function hideControls () {
  document.body.classList.remove('controls-fade-out')
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
