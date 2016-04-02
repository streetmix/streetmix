var SHORT_DELAY = 100

var RESIZE_TYPE_INITIAL = 0
var RESIZE_TYPE_INCREMENT = 1
var RESIZE_TYPE_DRAGGING = 2
var RESIZE_TYPE_PRECISE_DRAGGING = 3
var RESIZE_TYPE_TYPING = 4

var MIN_SEGMENT_WIDTH = 1
var MAX_SEGMENT_WIDTH = 400

var TOUCH_CONTROLS_FADEOUT_TIME = 3000
var TOUCH_CONTROLS_FADEOUT_DELAY = 3000

var NORMALIZE_PRECISION = 5

var segmentWidthResolution
var segmentWidthClickIncrement
var segmentWidthDraggingResolution

var suppressMouseEnter = false

function _resizeSegment (el, resizeType, width, updateEdit, palette, initial) {
  if (!palette) {
    var width =
    _normalizeSegmentWidth(width / TILE_SIZE, resizeType) * TILE_SIZE
  }

  document.body.classList.add('immediate-segment-resize')

  window.setTimeout(function () {
    document.body.classList.remove('immediate-segment-resize')
  }, SHORT_DELAY)

  var oldWidth = parseFloat(el.getAttribute('width') * TILE_SIZE)

  el.style.width = width + 'px'
  el.setAttribute('width', width / TILE_SIZE)

  var widthEl = el.querySelector('span.width')
  if (widthEl) {
    widthEl.innerHTML =
      _prettifyWidth(width / TILE_SIZE, { markup: true })
  }

  _setSegmentContents(el, el.getAttribute('type'),
    el.getAttribute('variant-string'), width, parseInt(el.getAttribute('rand-seed')), palette, false)

  if (updateEdit) {
    _infoBubble.updateWidthInContents(el, width / TILE_SIZE)
  }

  if (!initial) {
    _segmentsChanged()

    let segment = street.segments[parseInt(el.dataNo)]
    _infoBubble.updateWarningsInContents(segment)
  }
}

function _handleSegmentResizeCancel () {
  _resizeSegment(draggingResize.segmentEl, RESIZE_TYPE_INITIAL,
    draggingResize.originalWidth * TILE_SIZE, true, false)

  _handleSegmentResizeEnd()
}

function _handleSegmentResizeEnd (event) {
  ignoreStreetChanges = false

  _segmentsChanged()

  _changeDraggingType(DRAGGING_TYPE_NONE)

  var el = draggingResize.floatingEl
  removeElFromDOM(el)

  draggingResize.segmentEl.classList.add('immediate-show-drag-handles')

  _removeGuides(draggingResize.segmentEl)

  _infoBubble.considerSegmentEl = draggingResize.segmentEl
  _infoBubble.show(false)

  _scheduleControlsFadeout(draggingResize.segmentEl)

  suppressMouseEnter = true
  _infoBubble.considerShowing(event, draggingResize.segmentEl, INFO_BUBBLE_TYPE_SEGMENT)
  window.setTimeout(function () {
    suppressMouseEnter = false
  }, 50)

  if (draggingResize.width && (draggingResize.originalWidth != draggingResize.width)) {
    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'DRAGGING', null, true)
  }
}

function _normalizeAllSegmentWidths () {
  for (var i in street.segments) {
    street.segments[i].width =
      _normalizeSegmentWidth(street.segments[i].width, RESIZE_TYPE_INITIAL)
  }
}

function _normalizeSegmentWidth (width, resizeType) {
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
      var resolution = segmentWidthResolution
      break
    case RESIZE_TYPE_DRAGGING:
      var resolution = segmentWidthDraggingResolution
      break
  }

  width = Math.round(width / resolution) * resolution
  width = parseFloat(width.toFixed(NORMALIZE_PRECISION))

  return width
}

function _incrementSegmentWidth (segmentEl, add, precise) {
  var width = parseFloat(segmentEl.getAttribute('width'))

  if (precise) {
    var increment = segmentWidthResolution
  } else {
    var increment = segmentWidthClickIncrement
  }

  if (!add) {
    increment = -increment
  }
  width = _normalizeSegmentWidth(width + increment, RESIZE_TYPE_INCREMENT)

  _resizeSegment(segmentEl, RESIZE_TYPE_INCREMENT,
    width * TILE_SIZE, true, false)
}

function _applyWarningsToSegments () {
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

var controlsFadeoutDelayTimer = -1
var controlsFadeoutHideTimer = -1

function _scheduleControlsFadeout (el) {
  _infoBubble.considerShowing(null, el, INFO_BUBBLE_TYPE_SEGMENT)

  _resumeFadeoutControls()
}

function _resumeFadeoutControls () {
  if (!system.touch) {
    return
  }

  _cancelFadeoutControls()

  controlsFadeoutDelayTimer = window.setTimeout(_fadeoutControls, TOUCH_CONTROLS_FADEOUT_DELAY)
}

function _cancelFadeoutControls () {
  document.body.classList.remove('controls-fade-out')
  window.clearTimeout(controlsFadeoutDelayTimer)
  window.clearTimeout(controlsFadeoutHideTimer)
}

function _fadeoutControls () {
  document.body.classList.add('controls-fade-out')

  controlsFadeoutHideTimer = window.setTimeout(_hideControls, TOUCH_CONTROLS_FADEOUT_TIME)
}

function _hideControls () {
  document.body.classList.remove('controls-fade-out')
  if (_infoBubble.segmentEl) {
    _infoBubble.segmentEl.classList.remove('show-drag-handles')

    window.setTimeout(function () {
      _infoBubble.hide()
      _infoBubble.hideSegment(true)
    }, 0)
  }
}
