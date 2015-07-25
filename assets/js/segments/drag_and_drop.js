var TRACK_LABEL_DRAGGING = 'Dragging'

var DRAG_OFFSET_Y_PALETTE = -340 - 150
// Disable Y offset on segments when touch dragging
//var DRAG_OFFSET_Y_TOUCH_PALETTE = -100
//var DRAG_OFFSET_Y_TOUCH = -100

var DRAGGING_TYPE_NONE = 0
var DRAGGING_TYPE_CLICK_OR_MOVE = 1
var DRAGGING_TYPE_MOVE = 2
var DRAGGING_TYPE_RESIZE = 3

var DRAGGING_TYPE_MOVE_TRANSFER = 1
var DRAGGING_TYPE_MOVE_CREATE = 2

var MAX_DRAG_DEGREE = 20

var draggingType = DRAGGING_TYPE_NONE

var draggingResize = {
  segmentEl: null,
  floatingEl: null,
  mouseX: null,
  mouseY: null,
  elX: null,
  elY: null,
  width: null,
  originalX: null,
  originalWidth: null,
  right: false
}

var draggingMove = {
  type: null,
  active: false,
  withinCanvas: null,
  segmentBeforeEl: null,
  segmentAfterEl: null,
  mouseX: null,
  mouseY: null,
  el: null,
  elX: null,
  elY: null,
  originalEl: null,
  originalWidth: null,
  originalType: null,
  originalVariantString: null,
  originalRandSeed: null,
  floatingElVisible: false
}

function _changeDraggingType (newDraggingType) {
  draggingType = newDraggingType

  document.body.classList.remove('segment-move-dragging')
  document.body.classList.remove('segment-resize-dragging')

  switch (draggingType) {
    case DRAGGING_TYPE_RESIZE:
      document.body.classList.add('segment-resize-dragging')
      break
    case DRAGGING_TYPE_MOVE:
      document.body.classList.add('segment-move-dragging')
      break
  }
}

function _handleSegmentResizeStart (event) {
  if (readOnly) {
    return
  }

  if (event.touches && event.touches[0]) {
    var x = event.touches[0].pageX
    var y = event.touches[0].pageY
  } else {
    var x = event.pageX
    var y = event.pageY
  }

  ignoreStreetChanges = true

  var el = event.target

  _changeDraggingType(DRAGGING_TYPE_RESIZE)

  var pos = _getElAbsolutePos(el)

  draggingResize.right = el.classList.contains('right')

  draggingResize.floatingEl = document.createElement('div')
  draggingResize.floatingEl.classList.add('drag-handle')
  draggingResize.floatingEl.classList.add('floating')

  if (el.classList.contains('left')) {
    draggingResize.floatingEl.classList.add('left')
  } else {
    draggingResize.floatingEl.classList.add('right')
  }

  draggingResize.floatingEl.style.left = (pos[0] - document.querySelector('#street-section-outer').scrollLeft) + 'px'
  draggingResize.floatingEl.style.top = pos[1] + 'px'
  document.body.appendChild(draggingResize.floatingEl)

  draggingResize.mouseX = x
  draggingResize.mouseY = y

  draggingResize.elX = pos[0]
  draggingResize.elY = pos[1]

  draggingResize.originalX = draggingResize.elX
  draggingResize.originalWidth = parseFloat(el.segmentEl.getAttribute('width'))
  draggingResize.segmentEl = el.segmentEl

  draggingResize.segmentEl.classList.add('hover')

  var segmentInfo = SEGMENT_INFO[el.segmentEl.getAttribute('type')]
  var variantInfo = SEGMENT_INFO[el.segmentEl.getAttribute('type')].details[el.segmentEl.getAttribute('variant-string')]

  if (variantInfo.minWidth) {
    var guideEl = document.createElement('div')
    guideEl.classList.add('guide')
    guideEl.classList.add('min')

    var width = variantInfo.minWidth * TILE_SIZE
    guideEl.style.width = width + 'px'
    guideEl.style.marginLeft = (-width / 2) + 'px'
    el.segmentEl.appendChild(guideEl)
  }

  var remainingWidth =
  street.remainingWidth + parseFloat(el.segmentEl.getAttribute('width'))

  if (remainingWidth &&
    (((!variantInfo.minWidth) && (remainingWidth >= MIN_SEGMENT_WIDTH)) || (remainingWidth >= variantInfo.minWidth)) &&
    ((!variantInfo.maxWidth) || (remainingWidth <= variantInfo.maxWidth))) {
    var guideEl = document.createElement('div')
    guideEl.classList.add('guide')
    guideEl.classList.add('max')

    var width = remainingWidth * TILE_SIZE
    guideEl.style.width = width + 'px'
    guideEl.style.marginLeft = (-width / 2) + 'px'
    el.segmentEl.appendChild(guideEl)
  } else if (variantInfo.maxWidth) {
    var guideEl = document.createElement('div')
    guideEl.classList.add('guide')
    guideEl.classList.add('max')

    var width = variantInfo.maxWidth * TILE_SIZE
    guideEl.style.width = width + 'px'
    guideEl.style.marginLeft = (-width / 2) + 'px'
    el.segmentEl.appendChild(guideEl)
  }

  _infoBubble.hide()
  _infoBubble.hideSegment(true)
  _cancelFadeoutControls()
  _hideControls()

  window.setTimeout(function () {
    el.segmentEl.classList.add('hover')
  }, 0)
}

function _handleSegmentResizeMove (event) {
  if (event.touches && event.touches[0]) {
    var x = event.touches[0].pageX
    var y = event.touches[0].pageY
  } else {
    var x = event.pageX
    var y = event.pageY
  }

  var deltaX = x - draggingResize.mouseX
  var deltaY = y - draggingResize.mouseY

  var deltaFromOriginal = draggingResize.elX - draggingResize.originalX
  if (!draggingResize.right) {
    deltaFromOriginal = -deltaFromOriginal
  }

  draggingResize.elX += deltaX
  draggingResize.floatingEl.style.left = (draggingResize.elX - document.querySelector('#street-section-outer').scrollLeft) + 'px'

  draggingResize.width = draggingResize.originalWidth + deltaFromOriginal / TILE_SIZE * 2
  var precise = event.shiftKey

  if (precise) {
    var resizeType = RESIZE_TYPE_PRECISE_DRAGGING
  } else {
    var resizeType = RESIZE_TYPE_DRAGGING
  }

  _resizeSegment(draggingResize.segmentEl, resizeType,
    draggingResize.width * TILE_SIZE, true, false)

  draggingResize.mouseX = x
  draggingResize.mouseY = y
}

function _handleSegmentClickOrMoveStart (event) {
  if (readOnly) {
    return
  }

  ignoreStreetChanges = true

  if (event.touches && event.touches[0]) {
    var x = event.touches[0].pageX
    var y = event.touches[0].pageY
  } else {
    var x = event.pageX
    var y = event.pageY
  }

  var el = event.target
  draggingMove.originalEl = el

  _changeDraggingType(DRAGGING_TYPE_CLICK_OR_MOVE)

  draggingMove.mouseX = x
  draggingMove.mouseY = y
}

function _handleSegmentMoveStart () {
  if (readOnly) {
    return
  }

  _changeDraggingType(DRAGGING_TYPE_MOVE)

  draggingMove.originalType = draggingMove.originalEl.getAttribute('type')

  if (draggingMove.originalEl.classList.contains('palette')) {
    if (SEGMENT_INFO[draggingMove.originalType].needRandSeed) {
      draggingMove.originalRandSeed = _generateRandSeed()
    }
    draggingMove.type = DRAGGING_TYPE_MOVE_CREATE
    draggingMove.originalWidth =
      SEGMENT_INFO[draggingMove.originalType].defaultWidth * TILE_SIZE

    // TODO hack to get the first
    for (var j in SEGMENT_INFO[draggingMove.originalType].details) {
      draggingMove.originalVariantString = j
      break
    }
  } else {
    draggingMove.originalRandSeed =
      parseInt(draggingMove.originalEl.getAttribute('rand-seed'))
    draggingMove.type = DRAGGING_TYPE_MOVE_TRANSFER
    draggingMove.originalWidth =
      draggingMove.originalEl.offsetWidth
    draggingMove.originalVariantString =
      draggingMove.originalEl.getAttribute('variant-string')
  }

  var pos = _getElAbsolutePos(draggingMove.originalEl)

  draggingMove.elX = pos[0]
  draggingMove.elY = pos[1]

  if (draggingMove.type == DRAGGING_TYPE_MOVE_CREATE) {
    draggingMove.elY += DRAG_OFFSET_Y_PALETTE
    draggingMove.elX -= draggingMove.originalWidth / 3
  } else {
    draggingMove.elX -= document.querySelector('#street-section-outer').scrollLeft
  }

  draggingMove.floatingEl = document.createElement('div')
  draggingMove.floatingEl.classList.add('segment')
  draggingMove.floatingEl.classList.add('floating')
  draggingMove.floatingEl.classList.add('first-drag-move')
  draggingMove.floatingEl.setAttribute('type', draggingMove.originalType)
  draggingMove.floatingEl.setAttribute('variant-string',
    draggingMove.originalVariantString)
  draggingMove.floatingElVisible = false
  _setSegmentContents(draggingMove.floatingEl,
    draggingMove.originalType,
    draggingMove.originalVariantString,
    draggingMove.originalWidth,
    draggingMove.originalRandSeed,
    false, false)
  document.body.appendChild(draggingMove.floatingEl)

  if (system.cssTransform) {
    draggingMove.floatingEl.style[system.cssTransform] =
      'translate(' + draggingMove.elX + 'px, ' + draggingMove.elY + 'px)'
  } else {
    draggingMove.floatingEl.style.left = draggingMove.elX + 'px'
    draggingMove.floatingEl.style.top = draggingMove.elY + 'px'
  }

  if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
    draggingMove.originalEl.classList.add('dragged-out')
    draggingMove.originalEl.classList.remove('immediate-show-drag-handles')
    draggingMove.originalEl.classList.remove('show-drag-handles')
    draggingMove.originalEl.classList.remove('hover')
  }

  draggingMove.segmentBeforeEl = null
  draggingMove.segmentAfterEl = null
  _updateWithinCanvas(true)

  _infoBubble.hide()
  _cancelFadeoutControls()
  _hideControls()
}

function _updateWithinCanvas (_newWithinCanvas) {
  draggingMove.withinCanvas = _newWithinCanvas

  if (draggingMove.withinCanvas) {
    document.body.classList.remove('not-within-canvas')
  } else {
    document.body.classList.add('not-within-canvas')
  }
}

function _handleSegmentClickOrMoveMove (event) {
  if (event.touches && event.touches[0]) {
    var x = event.touches[0].pageX
    var y = event.touches[0].pageY
  } else {
    var x = event.pageX
    var y = event.pageY
  }

  var deltaX = x - draggingMove.mouseX
  var deltaY = y - draggingMove.mouseY

  // TODO const
  if ((Math.abs(deltaX) > 5) || (Math.abs(deltaY) > 5)) {
    _handleSegmentMoveStart()
    _handleSegmentMoveMove(event)
  }
}

function _handleSegmentMoveMove (event) {
  if (event.touches && event.touches[0]) {
    var x = event.touches[0].pageX
    var y = event.touches[0].pageY
  } else {
    var x = event.pageX
    var y = event.pageY
  }

  var deltaX = x - draggingMove.mouseX
  var deltaY = y - draggingMove.mouseY

  draggingMove.elX += deltaX
  draggingMove.elY += deltaY

  if (!draggingMove.floatingElVisible) {
    draggingMove.floatingElVisible = true

    /* // Disable Y offset on segments when touch dragging
    if (event.pointerType === 'touch') {
      if (draggingMove.type == DRAGGING_TYPE_MOVE_CREATE) {
        draggingMove.elY += DRAG_OFFSET_Y_TOUCH_PALETTE
      } else {
        draggingMove.elY += DRAG_OFFSET_Y_TOUCH
      }
    }
    */

    window.setTimeout(function () {
      draggingMove.floatingEl.classList.remove('first-drag-move')
    }, SHORT_DELAY)
  }

  if (system.cssTransform) {
    draggingMove.floatingEl.style[system.cssTransform] =
      'translate(' + draggingMove.elX + 'px, ' + draggingMove.elY + 'px)'

    var deg = deltaX

    if (deg > MAX_DRAG_DEGREE) {
      deg = MAX_DRAG_DEGREE
    } else if (deg < -MAX_DRAG_DEGREE) {
      deg = -MAX_DRAG_DEGREE
    }

    if (system.cssTransform) {
      draggingMove.floatingEl.querySelector('canvas').style[system.cssTransform] =
        'rotateZ(' + deg + 'deg)'
    }
  } else {
    draggingMove.floatingEl.style.left = draggingMove.elX + 'px'
    draggingMove.floatingEl.style.top = draggingMove.elY + 'px'
  }

  draggingMove.mouseX = x
  draggingMove.mouseY = y

  var newX = x - BUILDING_SPACE + document.querySelector('#street-section-outer').scrollLeft

  if (_makeSpaceBetweenSegments(newX, y)) {
    var smartDrop = _doDropHeuristics(draggingMove.originalType,
      draggingMove.originalVariantString, draggingMove.originalWidth)

    if ((smartDrop.type != draggingMove.originalType) || (smartDrop.variantString != draggingMove.originalVariantString)) {
      _setSegmentContents(draggingMove.floatingEl,
        smartDrop.type,
        smartDrop.variantString,
        smartDrop.width,
        draggingMove.originalRandSeed, false, true)

      draggingMove.originalType = smartDrop.type
      draggingMove.originalVariantString = smartDrop.variantString
    }
  }

  if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
    document.querySelector('#trashcan').classList.add('visible')
  }
}

function _onBodyMouseOut (event) {
  _infoBubble.hide()
}

function _onBodyMouseDown (event) {
  var el = event.target

  if (readOnly || (event.touches && event.touches.length != 1)) {
    return
  }

  var topEl = event.target

  // For street width editing on Firefox

  while (topEl && (topEl.id != 'street-width')) {
    topEl = topEl.parentNode
  }

  var withinMenu = !!topEl

  if (withinMenu) {
    return
  }

  _loseAnyFocus()

  var topEl = event.target

  while (topEl && (topEl.id != 'info-bubble') && (topEl.id != 'street-width') &&
    ((!topEl.classList) ||
    ((!topEl.classList.contains('menu-attached')) &&
    (!topEl.classList.contains('menu'))))) {
    topEl = topEl.parentNode
  }

  var withinMenu = !!topEl

  if (withinMenu) {
    return
  }

  MenuManager.hideAll()

  if (el.classList.contains('drag-handle')) {
    _handleSegmentResizeStart(event)
  } else {
    if (!el.classList.contains('segment') ||
      el.classList.contains('unmovable')) {
      return
    }

    _handleSegmentClickOrMoveStart(event)
  }

  event.preventDefault()
}

function _makeSpaceBetweenSegments (x, y) {
  var left = x - streetSectionCanvasLeft

  var selectedSegmentBefore = null
  var selectedSegmentAfter = null

  if (street.segments.length) {
    var farLeft = street.segments[0].el.savedNoMoveLeft
    var farRight =
    street.segments[street.segments.length - 1].el.savedNoMoveLeft +
      street.segments[street.segments.length - 1].el.savedWidth
  } else {
    var farLeft = 0
    var farRight = street.width * TILE_SIZE
  }
  // TODO const
  var space = (street.width - street.occupiedWidth) * TILE_SIZE / 2
  if (space < 100) {
    space = 100
  }

  // TODO const
  if ((left < farLeft - space) || (left > farRight + space) ||
    (y < streetSectionTop - 100) || (y > streetSectionTop + 300)) {
    _updateWithinCanvas(false)
  } else {
    _updateWithinCanvas(true)
    for (var i in street.segments) {
      var segment = street.segments[i]

      if (!selectedSegmentBefore && ((segment.el.savedLeft + segment.el.savedWidth / 2) > left)) {
        selectedSegmentBefore = segment.el
      }

      if ((segment.el.savedLeft + segment.el.savedWidth / 2) <= left) {
        selectedSegmentAfter = segment.el
      }
    }
  }

  if ((selectedSegmentBefore != draggingMove.segmentBeforeEl) ||
    (selectedSegmentAfter != draggingMove.segmentAfterEl)) {
    draggingMove.segmentBeforeEl = selectedSegmentBefore
    draggingMove.segmentAfterEl = selectedSegmentAfter
    _repositionSegments()
    return true
  } else {
    return false
  }
}

function _onBodyMouseMove (event) {
  if (draggingType === DRAGGING_TYPE_NONE) {
    return
  }

  switch (draggingType) {
    case DRAGGING_TYPE_CLICK_OR_MOVE:
      _handleSegmentClickOrMoveMove(event)
      break
    case DRAGGING_TYPE_MOVE:
      _handleSegmentMoveMove(event)
      break
    case DRAGGING_TYPE_RESIZE:
      _handleSegmentResizeMove(event)
      break
  }

  event.preventDefault()
}

function _doDropHeuristics (type, variantString, width) {
  // Automatically figure out width

  if (draggingMove.type == DRAGGING_TYPE_MOVE_CREATE) {
    if ((street.remainingWidth > 0) &&
      (width > street.remainingWidth * TILE_SIZE)) {
      var segmentMinWidth =
      SEGMENT_INFO[type].details[variantString].minWidth || 0

      if ((street.remainingWidth >= MIN_SEGMENT_WIDTH) &&
        (street.remainingWidth >= segmentMinWidth)) {
        width = _normalizeSegmentWidth(street.remainingWidth, RESIZE_TYPE_INITIAL) * TILE_SIZE
      }
    }
  }

  // Automatically figure out variants

  var leftEl = draggingMove.segmentAfterEl
  var rightEl = draggingMove.segmentBeforeEl

  var left = leftEl ? street.segments[leftEl.dataNo] : null
  var right = rightEl ? street.segments[rightEl.dataNo] : null

  var leftVariants = left && SEGMENT_INFO[left.type].variants
  var rightVariants = right && SEGMENT_INFO[right.type].variants

  var leftOwner = left && SEGMENT_INFO[left.type].owner
  var rightOwner = right && SEGMENT_INFO[right.type].owner

  var leftOwnerAsphalt =
  (leftOwner == SEGMENT_OWNER_CAR) || (leftOwner == SEGMENT_OWNER_BIKE) ||
    (leftOwner == SEGMENT_OWNER_PUBLIC_TRANSIT)
  var rightOwnerAsphalt =
  (rightOwner == SEGMENT_OWNER_CAR) || (rightOwner == SEGMENT_OWNER_BIKE) ||
    (rightOwner == SEGMENT_OWNER_PUBLIC_TRANSIT)

  var leftVariant = left && _getVariantArray(left.type, left.variantString)
  var rightVariant = right && _getVariantArray(right.type, right.variantString)

  var variant = _getVariantArray(type, variantString)

  // Direction

  if (SEGMENT_INFO[type].variants.indexOf('direction') != -1) {
    if (leftVariant && leftVariant['direction']) {
      variant['direction'] = leftVariant['direction']
    } else if (rightVariant && rightVariant['direction']) {
      variant['direction'] = rightVariant['direction']
    }
  }

  // Parking lane orientation

  if (SEGMENT_INFO[type].variants.indexOf('parking-lane-orientation') != -1) {
    if (!right || !rightOwnerAsphalt) {
      variant['parking-lane-orientation'] = 'right'
    } else if (!left || !leftOwnerAsphalt) {
      variant['parking-lane-orientation'] = 'left'
    }
  }

  // Parklet orientation

  if (type == 'parklet') {
    if (left && leftOwnerAsphalt) {
      variant['orientation'] = 'right'
    } else if (right && rightOwnerAsphalt) {
      variant['orientation'] = 'left'
    }
  }

  // Turn lane orientation

  if (SEGMENT_INFO[type].variants.indexOf('turn-lane-orientation') != -1) {
    if (!right || !rightOwnerAsphalt) {
      variant['turn-lane-orientation'] = 'right'
    } else if (!left || !leftOwnerAsphalt) {
      variant['turn-lane-orientation'] = 'left'
    }
  }

  // Transit shelter orientation and elevation

  if (type == 'transit-shelter') {
    if (left && (leftOwner == SEGMENT_OWNER_PUBLIC_TRANSIT)) {
      variant['orientation'] = 'right'
    } else if (right && (rightOwner == SEGMENT_OWNER_PUBLIC_TRANSIT)) {
      variant['orientation'] = 'left'
    }
  }

  if (SEGMENT_INFO[type].variants.indexOf('transit-shelter-elevation') != -1) {
    if (variant['orientation'] == 'right' && left && left.type == 'light-rail') {
      variant['transit-shelter-elevation'] = 'light-rail'
    } else if (variant['orientation'] == 'left' && right && right.type == 'light-rail') {
      variant['transit-shelter-elevation'] = 'light-rail'
    }
  }

  // Bike rack orientation

  if (type == 'sidewalk-bike-rack') {
    if (left && (leftOwner != SEGMENT_OWNER_PEDESTRIAN)) {
      variant['orientation'] = 'left'
    } else if (right && (rightOwner != SEGMENT_OWNER_PEDESTRIAN)) {
      variant['orientation'] = 'right'
    }
  }

  // Lamp orientation

  if (SEGMENT_INFO[type].variants.indexOf('lamp-orientation') != -1) {
    if (left && right && leftOwnerAsphalt && rightOwnerAsphalt) {
      variant['lamp-orientation'] = 'both'
    } else if (left && leftOwnerAsphalt) {
      variant['lamp-orientation'] = 'left'
    } else if (right && rightOwnerAsphalt) {
      variant['lamp-orientation'] = 'right'
    } else if (left && right) {
      variant['lamp-orientation'] = 'both'
    } else if (left) {
      variant['lamp-orientation'] = 'left'
    } else if (right) {
      variant['lamp-orientation'] = 'right'
    } else {
      variant['lamp-orientation'] = 'both'
    }
  }

  variantString = _getVariantString(variant)

  return { type: type, variantString: variantString, width: width }
}

function _handleSegmentMoveCancel () {
  draggingMove.originalEl.classList.remove('dragged-out')

  draggingMove.segmentBeforeEl = null
  draggingMove.segmentAfterEl = null

  _repositionSegments()
  _updateWithinCanvas(true)

  _removeElFromDom(draggingMove.floatingEl)
  document.querySelector('#trashcan').classList.remove('visible')

  _changeDraggingType(DRAGGING_TYPE_NONE)
}

function _handleSegmentMoveEnd (event) {
  ignoreStreetChanges = false

  var failedDrop = false

  var segmentElControls = null

  if (!draggingMove.withinCanvas) {
    if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
      _removeElFromDom(draggingMove.originalEl)
    }

    EventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_REMOVE_SEGMENT,
      TRACK_LABEL_DRAGGING, null, true)
  } else if (draggingMove.segmentBeforeEl || draggingMove.segmentAfterEl || (street.segments.length == 0)) {
    var smartDrop = _doDropHeuristics(draggingMove.originalType,
      draggingMove.originalVariantString, draggingMove.originalWidth)

    var newEl = _createSegment(smartDrop.type,
      smartDrop.variantString, smartDrop.width, false, false, draggingMove.originalRandSeed)

    newEl.classList.add('create')

    if (draggingMove.segmentBeforeEl) {
      document.querySelector('#street-section-editable').
        insertBefore(newEl, draggingMove.segmentBeforeEl)
    } else if (draggingMove.segmentAfterEl) {
      document.querySelector('#street-section-editable').
        insertBefore(newEl, draggingMove.segmentAfterEl.nextSibling)
    } else {
      // empty street
      document.querySelector('#street-section-editable').appendChild(newEl)
    }

    window.setTimeout(function () {
      newEl.classList.remove('create')
    }, SHORT_DELAY)

    if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
      var draggedOutEl = document.querySelector('.segment.dragged-out')
      _removeElFromDom(draggedOutEl)
    }

    segmentElControls = newEl
  } else {
    failedDrop = true

    draggingMove.originalEl.classList.remove('dragged-out')

    segmentElControls = draggingMove.originalEl
  }

  draggingMove.segmentBeforeEl = null
  draggingMove.segmentAfterEl = null

  _repositionSegments()
  _segmentsChanged()
  _updateWithinCanvas(true)

  _removeElFromDom(draggingMove.floatingEl)
  document.querySelector('#trashcan').classList.remove('visible')

  _changeDraggingType(DRAGGING_TYPE_NONE)

  if (segmentElControls) {
    _scheduleControlsFadeout(segmentElControls)
  }

  if (failedDrop) {
    _infoBubble.show(true)
  }
}

function _removeGuides (el) {
  var guideEl
  while (guideEl = el.querySelector('.guide')) {
    _removeElFromDom(guideEl)
  }
}

function _onBodyMouseUp (event) {
  switch (draggingType) {
    case DRAGGING_TYPE_NONE:
      return
    case DRAGGING_TYPE_CLICK_OR_MOVE:
      _changeDraggingType(DRAGGING_TYPE_NONE)
      ignoreStreetChanges = false

      // click!
      // _nextSegmentVariant(draggingMove.originalEl.dataNo)
      break
    case DRAGGING_TYPE_MOVE:
      _handleSegmentMoveEnd(event)
      break
    case DRAGGING_TYPE_RESIZE:
      _handleSegmentResizeEnd(event)
      break
  }

  event.preventDefault()
}
