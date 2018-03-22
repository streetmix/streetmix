import { trackEvent } from '../app/event_tracking'
import { INFO_BUBBLE_TYPE_SEGMENT, infoBubble } from '../info_bubble/info_bubble'
import { system } from '../preinit/system_capabilities'
import { setIgnoreStreetChanges } from '../streets/data_model'
import {
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL,
  SEGMENT_WARNING_WIDTH_TOO_LARGE
} from '../streets/width'
import { prettifyWidth } from '../util/width_units'
import {
  DRAGGING_TYPE_NONE,
  draggingResize,
  changeDraggingType,
  removeGuides
} from './drag_and_drop'
import { TILE_SIZE, setSegmentContents, segmentsChanged } from './view'
import store from '../store'
import { changeSegmentWidth } from '../store/actions/street'

export const SHORT_DELAY = 100

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

let _segmentWidthResolution

export function getSegmentWidthResolution () {
  return _segmentWidthResolution
}

export function setSegmentWidthResolution (value) {
  _segmentWidthResolution = value
}

let _segmentWidthClickIncrement

export function setSegmentWidthClickIncrement (value) {
  _segmentWidthClickIncrement = value
}

let _segmentWidthDraggingResolution

export function setSegmentWidthDraggingResolution (value) {
  _segmentWidthDraggingResolution = value
}

let _suppressMouseEnter = false

export function suppressMouseEnter () {
  return _suppressMouseEnter
}

export function resizeSegment (el, resizeType, width, updateEdit, palette, initial) {
  if (!palette) {
    width = normalizeSegmentWidth(width, resizeType)
  }

  document.body.classList.add('immediate-segment-resize')

  window.setTimeout(function () {
    document.body.classList.remove('immediate-segment-resize')
  }, SHORT_DELAY)

  el.style.width = (width * TILE_SIZE) + 'px'

  el.setAttribute('data-width', width)

  var widthEl = el.querySelector('span.width')
  if (widthEl) {
    widthEl.innerHTML = prettifyWidth(width, store.getState().street.units, { markup: true })
  }

  setSegmentContents(el, el.getAttribute('type'),
    el.getAttribute('variant-string'), width * TILE_SIZE, parseInt(el.getAttribute('rand-seed')), palette, false)

  if (!initial) {
    segmentsChanged()
    infoBubble.updateContents()
  }

  return width
}

export function handleSegmentResizeCancel () {
  resizeSegment(draggingResize.segmentEl, RESIZE_TYPE_INITIAL, draggingResize.originalWidth, true, false)

  handleSegmentResizeEnd()
}

export function handleSegmentResizeEnd (event) {
  setIgnoreStreetChanges(false)

  segmentsChanged()

  changeDraggingType(DRAGGING_TYPE_NONE)

  var el = draggingResize.floatingEl
  el.remove()

  draggingResize.segmentEl.classList.add('immediate-show-drag-handles')

  removeGuides(draggingResize.segmentEl)

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
  for (var i in street.segments) {
    const width = normalizeSegmentWidth(street.segments[i].width, RESIZE_TYPE_INITIAL)
    store.dispatch(changeSegmentWidth(i, width))
  }
}

export function normalizeSegmentWidth (width, resizeType) {
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
      resolution = _segmentWidthResolution
      break
    case RESIZE_TYPE_DRAGGING:
      resolution = _segmentWidthDraggingResolution
      break
  }

  width = Math.round(width / resolution) * resolution
  width = Number.parseFloat(width.toFixed(NORMALIZE_PRECISION))

  return width
}

// temp: add origWidth as 4th arg to pass in value from redux
export function incrementSegmentWidth (segmentEl, add, precise, origWidth) {
  let increment, width

  if (typeof origWidth === 'number') {
    width = origWidth
  } else {
    width = Number.parseFloat(segmentEl.getAttribute('data-width'))
  }

  if (precise) {
    increment = _segmentWidthResolution
  } else {
    increment = _segmentWidthClickIncrement
  }

  if (!add) {
    increment = -increment
  }
  width = normalizeSegmentWidth(width + increment, RESIZE_TYPE_INCREMENT)

  resizeSegment(segmentEl, RESIZE_TYPE_INCREMENT, width, true, false)

  return width
}

export function applyWarningsToSegments () {
  const street = store.getState().street
  for (var i in street.segments) {
    var segment = street.segments[i]

    if (segment.el) {
      if (segment.warnings[SEGMENT_WARNING_OUTSIDE] ||
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] ||
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]) {
        segment.el.classList.add('warning')
      } else {
        segment.el.classList.remove('warning')
      }

      if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
        segment.el.classList.add('outside')
      } else {
        segment.el.classList.remove('outside')
      }
    }
  }
}

let controlsFadeoutDelayTimer = -1
let controlsFadeoutHideTimer = -1

export function scheduleControlsFadeout (el) {
  infoBubble.considerShowing(null, el, INFO_BUBBLE_TYPE_SEGMENT)

  resumeFadeoutControls()
}

export function resumeFadeoutControls () {
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
