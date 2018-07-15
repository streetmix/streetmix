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
import store from '../store'
import { updateSegments, changeSegmentWidth } from '../store/actions/street'

const SHORT_DELAY = 100

export const RESIZE_TYPE_INITIAL = 0
const RESIZE_TYPE_INCREMENT = 1
export const RESIZE_TYPE_DRAGGING = 2
export const RESIZE_TYPE_PRECISE_DRAGGING = 3
export const RESIZE_TYPE_TYPING = 4

export const MIN_SEGMENT_WIDTH = (1 / 0.3) * 0.25 // This is equal to 0.25m in our conversion rate
export const MAX_SEGMENT_WIDTH = 400

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

export function handleSegmentResizeEnd (event) {
  setIgnoreStreetChanges(false)

  segmentsChanged()

  changeDraggingType(DRAGGING_TYPE_NONE)

  var el = draggingResize.floatingEl
  el.remove()

  draggingResize.segmentEl.classList.add('immediate-show-drag-handles')

  // todo: refactor
  window.dispatchEvent(new window.CustomEvent('stmx:hide_segment_guides'))

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
