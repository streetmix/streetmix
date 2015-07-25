var SHORT_DELAY = 100
var WIDTH_EDIT_INPUT_DELAY = 200

var TRACK_ACTION_CHANGE_WIDTH = 'Change width'
var TRACK_LABEL_INCREMENT_BUTTON = 'Increment button'
var TRACK_LABEL_INPUT_FIELD = 'Input field'

var RESIZE_TYPE_INITIAL = 0
var RESIZE_TYPE_INCREMENT = 1
var RESIZE_TYPE_DRAGGING = 2
var RESIZE_TYPE_PRECISE_DRAGGING = 3
var RESIZE_TYPE_TYPING = 4

var MIN_SEGMENT_WIDTH = 1
var MAX_SEGMENT_WIDTH = 400

var segmentWidthResolution
var segmentWidthClickIncrement
var segmentWidthDraggingResolution

var widthHeightEditHeld = false
var widthHeightChangeTimerId = -1

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
      _prettifyWidth(width / TILE_SIZE, PRETTIFY_WIDTH_OUTPUT_MARKUP)
  }

  _setSegmentContents(el, el.getAttribute('type'),
    el.getAttribute('variant-string'), width, parseInt(el.getAttribute('rand-seed')), palette, false)

  if (updateEdit) {
    _infoBubble.updateWidthInContents(el, width / TILE_SIZE)
  }

  if (!initial) {
    _segmentsChanged()
  }
}

function _onWidthHeightEditClick (event) {
  var el = event.target

  el.hold = true
  widthHeightEditHeld = true

  if (document.activeElement != el) {
    el.select()
  }
}

function _onWidthHeightEditMouseOver (event) {
  if (!widthHeightEditHeld) {
    event.target.focus()
    event.target.select()
  }
}

function _onWidthHeightEditMouseOut (event) {
  var el = event.target
  if (!widthHeightEditHeld) {
    _loseAnyFocus()
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
  _removeElFromDom(el)

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
    EventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH,
      TRACK_LABEL_DRAGGING, null, true)
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

function _onWidthEditFocus (event) {
  var el = event.target

  el.oldValue = el.realValue
  el.value = _prettifyWidth(el.realValue, PRETTIFY_WIDTH_INPUT)
}

function _onHeightEditFocus (event) {
  var el = event.target

  el.oldValue = el.realValue
  el.value = _prettifyHeight(el.realValue, PRETTIFY_WIDTH_INPUT)
}

function _onWidthEditBlur (event) {
  var el = event.target

  _widthEditInputChanged(el, true)

  el.realValue = parseFloat(el.segmentEl.getAttribute('width'))
  el.value = _prettifyWidth(el.realValue, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP)

  el.hold = false
  widthHeightEditHeld = false
}

function _onHeightEditBlur (event) {
  var el = event.target

  _heightEditInputChanged(el, true)

  el.realValue = (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ? street.leftBuildingHeight : street.rightBuildingHeight
  el.value = _prettifyHeight(el.realValue, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP)

  el.hold = false
  widthHeightEditHeld = false
}

function _heightEditInputChanged (el, immediate) {
  window.clearTimeout(widthHeightChangeTimerId)

  var height = parseInt(el.value)

  if (!height || (height < 1)) {
    height = 1
  } else if (height > MAX_BUILDING_HEIGHT) {
    height = MAX_BUILDING_HEIGHT
  }

  if (immediate) {
    if (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) {
      street.leftBuildingHeight = height
    } else {
      street.rightBuildingHeight = height
    }
    _buildingHeightUpdated()
  } else {
    widthHeightChangeTimerId = window.setTimeout(function () {
      if (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) {
        street.leftBuildingHeight = height
      } else {
        street.rightBuildingHeight = height
      }
      _buildingHeightUpdated()
    }, WIDTH_EDIT_INPUT_DELAY)
  }
}

function _widthEditInputChanged (el, immediate) {
  window.clearTimeout(widthHeightChangeTimerId)

  var width = _processWidthInput(el.value)

  if (width) {
    var segmentEl = el.segmentEl

    if (immediate) {
      _resizeSegment(segmentEl, RESIZE_TYPE_TYPING,
        width * TILE_SIZE, false, false)
      _infoBubble.updateWidthButtonsInContents(width)
    } else {
      widthHeightChangeTimerId = window.setTimeout(function () {
        _resizeSegment(segmentEl, RESIZE_TYPE_TYPING,
          width * TILE_SIZE, false, false)
        _infoBubble.updateWidthButtonsInContents(width)
      }, WIDTH_EDIT_INPUT_DELAY)
    }
  }
}

function _onWidthEditInput (event) {
  _widthEditInputChanged(event.target, false)

  EventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH,
    TRACK_LABEL_INPUT_FIELD, null, true)
}

function _onHeightEditInput (event) {
  _heightEditInputChanged(event.target, false)
}

function _onWidthEditKeyDown (event) {
  var el = event.target

  switch (event.keyCode) {
    case KEYS.ENTER:
      _widthEditInputChanged(el, true)
      _loseAnyFocus()
      el.value = _prettifyWidth(el.segmentEl.getAttribute('width'), PRETTIFY_WIDTH_INPUT)
      el.focus()
      el.select()
      break
    case KEYS.ESC:
      el.value = el.oldValue
      _widthEditInputChanged(el, true)
      MenuManager.hideAll()
      _loseAnyFocus()
      break
  }
}

function _onHeightEditKeyDown (event) {
  var el = event.target

  switch (event.keyCode) {
    case KEYS.ENTER:
      _heightEditInputChanged(el, true)
      _loseAnyFocus()
      el.value = _prettifyHeight((_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ? street.leftBuildingHeight : street.rightBuildingHeight, PRETTIFY_WIDTH_INPUT)
      el.focus()
      el.select()
      break
    case KEYS.ESC:
      el.value = el.oldValue
      _heightEditInputChanged(el, true)
      MenuManager.hideAll()
      _loseAnyFocus()
      break
  }
}

function _prettifyHeight (height, purpose) {
  var heightText = height

  switch (purpose) {
    case PRETTIFY_WIDTH_INPUT:
      break
    case PRETTIFY_WIDTH_OUTPUT_MARKUP:
    case PRETTIFY_WIDTH_OUTPUT_NO_MARKUP:
      heightText += ' floor'
      if (height > 1) {
        heightText += 's'
      }

      var attr = _getBuildingAttributes(street, _infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING)

      heightText += ' (' + _prettifyWidth(attr.realHeight / TILE_SIZE, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP) + ')'

      break
  }
  return heightText
}

function _onWidthDecrementClick (event) {
  var el = event.target
  var segmentEl = el.segmentEl
  var precise = event.shiftKey

  _incrementSegmentWidth(segmentEl, false, precise)
  _scheduleControlsFadeout(segmentEl)

  EventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH,
    TRACK_LABEL_INCREMENT_BUTTON, null, true)
}

function _onWidthIncrementClick (event) {
  var el = event.target
  var segmentEl = el.segmentEl
  var precise = event.shiftKey

  _incrementSegmentWidth(segmentEl, true, precise)
  _scheduleControlsFadeout(segmentEl)

  EventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH,
    TRACK_LABEL_INCREMENT_BUTTON, null, true)
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
    _infoBubble.updateWarningsInContents(segment)
  }
}
