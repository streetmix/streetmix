var CANVAS_HEIGHT = 480
var CANVAS_GROUND = 35
var CANVAS_BASELINE = CANVAS_HEIGHT - CANVAS_GROUND

var SEGMENT_Y_NORMAL = 265
var SEGMENT_Y_PALETTE = 20

var STATUS_MESSAGE_HIDE_DELAY = 15000

var DRAGGING_MOVE_HOLE_WIDTH = 40

var SEGMENT_SWITCHING_TIME = 250

function _drawSegmentImage (tileset, ctx, sx, sy, sw, sh, dx, dy, dw, dh) {
  if (!sw || !sh || !dw || !dh) {
    return
  }

  if ((imagesToBeLoaded == 0) && (sw > 0) && (sh > 0) && (dw > 0) && (dh > 0)) {
    sx += TILESET_CORRECTION[tileset] * 12

    dx *= system.hiDpi
    dy *= system.hiDpi
    dw *= system.hiDpi
    dh *= system.hiDpi

    if (sx < 0) {
      dw += sx
      sx = 0
    }

    if (debug.canvasRectangles) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(dx, dy, dw, dh)
    }

    ctx.drawImage(images['/images/tiles-' + tileset + '.png'],
      sx * TILESET_POINT_PER_PIXEL, sy * TILESET_POINT_PER_PIXEL,
      sw * TILESET_POINT_PER_PIXEL, sh * TILESET_POINT_PER_PIXEL,
      dx, dy, dw, dh)
  }
}

function _getVariantInfoDimensions (variantInfo, initialSegmentWidth, multiplier) {
  var segmentWidth = initialSegmentWidth / TILE_SIZE / multiplier

  var center = segmentWidth / 2
  var left = center
  var right = center

  if (variantInfo.graphics.center) {
    var graphic = variantInfo.graphics.center
    for (var l = 0; l < graphic.length; l++) {
      var newLeft = center - graphic[l].width / 2 + (graphic[l].offsetX || 0)
      var newRight = center + graphic[l].width / 2 + (graphic[l].offsetX || 0)

      if (newLeft < left) {
        left = newLeft
      }
      if (newRight > right) {
        right = newRight
      }
    }
  }

  if (variantInfo.graphics.left) {
    var graphic = variantInfo.graphics.left
    for (var l = 0; l < graphic.length; l++) {
      var newLeft = graphic[l].offsetX || 0
      var newRight = graphic[l].width + (graphic[l].offsetX || 0)

      if (newLeft < left) {
        left = newLeft
      }
      if (newRight > right) {
        right = newRight
      }
    }
  }

  if (variantInfo.graphics.right) {
    var graphic = variantInfo.graphics.right
    for (var l = 0; l < graphic.length; l++) {
      var newLeft = (segmentWidth) - (graphic[l].offsetX || 0) - graphic[l].width
      var newRight = (segmentWidth) - (graphic[l].offsetX || 0)

      if (newLeft < left) {
        left = newLeft
      }
      if (newRight > right) {
        right = newRight
      }
    }
  }

  if (variantInfo.graphics.repeat && variantInfo.graphics.repeat[0]) {
    var newLeft = center - (segmentWidth / 2)
    var newRight = center + (segmentWidth / 2)

    if (newLeft < left) {
      left = newLeft
    }
    if (newRight > right) {
      right = newRight
    }
  }

  return { left: left, right: right, center: center }
}

function _drawSegmentContents (ctx, type, variantString, segmentWidth, offsetLeft, offsetTop, randSeed, multiplier, palette) {
  var segmentInfo = SEGMENT_INFO[type]
  var variantInfo = SEGMENT_INFO[type].details[variantString]

  var dimensions = _getVariantInfoDimensions(variantInfo, segmentWidth, multiplier)
  var left = dimensions.left
  var right = dimensions.right
  var center = dimensions.center

  if (variantInfo.graphics.repeat) {
    for (var l = 0; l < variantInfo.graphics.repeat.length; l++) {
      var repeatPositionX = variantInfo.graphics.repeat[l].x * TILE_SIZE
      var repeatPositionY = (variantInfo.graphics.repeat[l].y || 0) * TILE_SIZE
      var w = variantInfo.graphics.repeat[l].width * TILE_SIZE * multiplier

      var count = Math.floor((segmentWidth) / w + 1)

      if (left < 0) {
        var repeatStartX = -left * TILE_SIZE
      } else {
        var repeatStartX = 0
      }

      for (var i = 0; i < count; i++) {
        // remainder
        if (i == count - 1) {
          w = segmentWidth - (count - 1) * w
        }

        _drawSegmentImage(variantInfo.graphics.repeat[l].tileset, ctx,
          repeatPositionX, repeatPositionY,
          w, variantInfo.graphics.repeat[l].height * TILE_SIZE,
          offsetLeft + (repeatStartX + (i * variantInfo.graphics.repeat[l].width) * TILE_SIZE) * multiplier,
          offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.repeat[l].offsetY || 0)),
          w,
          variantInfo.graphics.repeat[l].height * TILE_SIZE * multiplier)
      }
    }
  }

  if (variantInfo.graphics.left) {
    for (var l = 0; l < variantInfo.graphics.left.length; l++) {
      var leftPositionX = variantInfo.graphics.left[l].x * TILE_SIZE
      var leftPositionY = (variantInfo.graphics.left[l].y || 0) * TILE_SIZE

      var w = variantInfo.graphics.left[l].width * TILE_SIZE

      var x = 0 + (-left + (variantInfo.graphics.left[l].offsetX || 0)) * TILE_SIZE * multiplier

      _drawSegmentImage(variantInfo.graphics.left[l].tileset, ctx,
        leftPositionX, leftPositionY,
        w, variantInfo.graphics.left[l].height * TILE_SIZE,
        offsetLeft + x,
        offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.left[l].offsetY || 0)),
        w * multiplier, variantInfo.graphics.left[l].height * TILE_SIZE * multiplier)
    }
  }

  if (variantInfo.graphics.right) {
    for (var l = 0; l < variantInfo.graphics.right.length; l++) {
      var rightPositionX = variantInfo.graphics.right[l].x * TILE_SIZE
      var rightPositionY = (variantInfo.graphics.right[l].y || 0) * TILE_SIZE

      var w = variantInfo.graphics.right[l].width * TILE_SIZE

      var x = (-left + segmentWidth / TILE_SIZE / multiplier - variantInfo.graphics.right[l].width - (variantInfo.graphics.right[l].offsetX || 0)) * TILE_SIZE * multiplier

      _drawSegmentImage(variantInfo.graphics.right[l].tileset, ctx,
        rightPositionX, rightPositionY,
        w, variantInfo.graphics.right[l].height * TILE_SIZE,
        offsetLeft + x,
        offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.right[l].offsetY || 0)),
        w * multiplier, variantInfo.graphics.right[l].height * TILE_SIZE * multiplier)
    }
  }

  if (variantInfo.graphics.center) {
    for (var l = 0; l < variantInfo.graphics.center.length; l++) {
      var bkPositionX = (variantInfo.graphics.center[l].x || 0) * TILE_SIZE
      var bkPositionY = (variantInfo.graphics.center[l].y || 0) * TILE_SIZE

      var width = variantInfo.graphics.center[l].width

      var x = (center - variantInfo.graphics.center[l].width / 2 - left - (variantInfo.graphics.center[l].offsetX || 0)) * TILE_SIZE * multiplier

      _drawSegmentImage(variantInfo.graphics.center[l].tileset, ctx,
        bkPositionX, bkPositionY,
        width * TILE_SIZE, variantInfo.graphics.center[l].height * TILE_SIZE,
        offsetLeft + x,
        offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.center[l].offsetY || 0)),
        width * TILE_SIZE * multiplier, variantInfo.graphics.center[l].height * TILE_SIZE * multiplier)
    }
  }

  if (type == 'sidewalk') {
    _drawProgrammaticPeople(ctx, segmentWidth / multiplier, offsetLeft - left * TILE_SIZE * multiplier, offsetTop, randSeed, multiplier, variantString)
  }
}

function _setSegmentContents (el, type, variantString, segmentWidth, randSeed, palette, quickUpdate) {
  var segmentInfo = SEGMENT_INFO[type]
  var variantInfo = SEGMENT_INFO[type].details[variantString]

  var multiplier = palette ? (WIDTH_PALETTE_MULTIPLIER / TILE_SIZE) : 1
  var dimensions = _getVariantInfoDimensions(variantInfo, segmentWidth, multiplier)

  var totalWidth = dimensions.right - dimensions.left

  var offsetTop = palette ? SEGMENT_Y_PALETTE : SEGMENT_Y_NORMAL

  if (!quickUpdate) {
    var hoverBkEl = document.createElement('div')
    hoverBkEl.classList.add('hover-bk')
  }

  if (!quickUpdate) {
    var canvasEl = document.createElement('canvas')
    canvasEl.classList.add('image')
  } else {
    var canvasEl = el.querySelector('canvas')
  }
  canvasEl.width = totalWidth * TILE_SIZE * system.hiDpi
  canvasEl.height = CANVAS_BASELINE * system.hiDpi
  canvasEl.style.width = (totalWidth * TILE_SIZE) + 'px'
  canvasEl.style.height = CANVAS_BASELINE + 'px'
  canvasEl.style.left = (dimensions.left * TILE_SIZE * multiplier) + 'px'

  var ctx = canvasEl.getContext('2d')

  _drawSegmentContents(ctx, type, variantString, segmentWidth, 0, offsetTop, randSeed, multiplier, palette)

  if (!quickUpdate) {
    _removeElFromDom(el.querySelector('canvas'))
    el.appendChild(canvasEl)

    _removeElFromDom(el.querySelector('.hover-bk'))
    el.appendChild(hoverBkEl)
  }
}

function _createSegment (type, variantString, width, isUnmovable, palette, randSeed) {
  var el = document.createElement('div')
  el.classList.add('segment')
  el.setAttribute('type', type)
  el.setAttribute('variant-string', variantString)
  if (randSeed) {
    el.setAttribute('rand-seed', randSeed)
  }

  if (isUnmovable) {
    el.classList.add('unmovable')
  }

  if (!palette) {
    el.style.zIndex = SEGMENT_INFO[type].zIndex

    var variantInfo = SEGMENT_INFO[type].details[variantString]
    var name = variantInfo.name || SEGMENT_INFO[type].name

    var innerEl = document.createElement('span')
    innerEl.classList.add('name')
    innerEl.innerHTML = name
    el.appendChild(innerEl)

    var innerEl = document.createElement('span')
    innerEl.classList.add('width')
    el.appendChild(innerEl)

    var dragHandleEl = document.createElement('span')
    dragHandleEl.classList.add('drag-handle')
    dragHandleEl.classList.add('left')
    dragHandleEl.segmentEl = el
    dragHandleEl.innerHTML = '‹'
    el.appendChild(dragHandleEl)

    var dragHandleEl = document.createElement('span')
    dragHandleEl.classList.add('drag-handle')
    dragHandleEl.classList.add('right')
    dragHandleEl.segmentEl = el
    dragHandleEl.innerHTML = '›'
    el.appendChild(dragHandleEl)

    var innerEl = document.createElement('span')
    innerEl.classList.add('grid')
    el.appendChild(innerEl)
  } else {
    el.setAttribute('title', SEGMENT_INFO[type].name)
  }

  if (width) {
    _resizeSegment(el, RESIZE_TYPE_INITIAL, width, true, palette, true)
  }

  if (!palette) {
    el.addEventListener('pointerenter', _onSegmentMouseEnter)
    el.addEventListener('pointerleave', _onSegmentMouseLeave)
  }
  return el
}

function _createSegmentDom (segment) {
  return _createSegment(segment.type, segment.variantString,
    segment.width * TILE_SIZE, segment.unmovable, false, segment.randSeed)
}

function _fillEmptySegment (el) {
  var innerEl = document.createElement('span')
  innerEl.classList.add('name')
  innerEl.innerHTML = msg('SEGMENT_NAME_EMPTY')
  el.appendChild(innerEl)

  var innerEl = document.createElement('span')
  innerEl.classList.add('width')
  el.appendChild(innerEl)

  var innerEl = document.createElement('span')
  innerEl.classList.add('grid')
  el.appendChild(innerEl)
}

function _fillEmptySegments () {
  _fillEmptySegment(document.querySelector('#street-section-left-empty-space'))
  _fillEmptySegment(document.querySelector('#street-section-right-empty-space'))
}

function _repositionSegments () {
  var left = 0
  var noMoveLeft = 0

  var extraWidth = 0

  for (var i in street.segments) {
    var el = street.segments[i].el

    if (el == draggingMove.segmentBeforeEl) {
      left += DRAGGING_MOVE_HOLE_WIDTH
      extraWidth += DRAGGING_MOVE_HOLE_WIDTH

      if (!draggingMove.segmentAfterEl) {
        left += DRAGGING_MOVE_HOLE_WIDTH
        extraWidth += DRAGGING_MOVE_HOLE_WIDTH
      }
    }

    if (el.classList.contains('dragged-out')) {
      var width = 0
    } else {
      var width = parseFloat(el.getAttribute('width')) * TILE_SIZE
    }

    el.savedLeft = parseInt(left); // so we don’t have to use offsetLeft
    el.savedNoMoveLeft = parseInt(noMoveLeft); // so we don’t have to use offsetLeft
    el.savedWidth = parseInt(width)

    left += width
    noMoveLeft += width

    if (el == draggingMove.segmentAfterEl) {
      left += DRAGGING_MOVE_HOLE_WIDTH
      extraWidth += DRAGGING_MOVE_HOLE_WIDTH

      if (!draggingMove.segmentBeforeEl) {
        left += DRAGGING_MOVE_HOLE_WIDTH
        extraWidth += DRAGGING_MOVE_HOLE_WIDTH
      }
    }
  }

  var occupiedWidth = left
  var noMoveOccupiedWidth = noMoveLeft

  var mainLeft = Math.round((street.width * TILE_SIZE - occupiedWidth) / 2)
  var mainNoMoveLeft = Math.round((street.width * TILE_SIZE - noMoveOccupiedWidth) / 2)

  for (var i in street.segments) {
    var el = street.segments[i].el

    el.savedLeft += mainLeft
    el.savedNoMoveLeft += mainNoMoveLeft

    if (system.cssTransform) {
      el.style[system.cssTransform] = 'translateX(' + el.savedLeft + 'px)'
      el.cssTransformLeft = el.savedLeft
    } else {
      el.style.left = el.savedLeft + 'px'
    }
  }

  if (system.cssTransform) {
    document.querySelector('#street-section-left-empty-space').
      style[system.cssTransform] = 'translateX(' + (-extraWidth / 2) + 'px)'
    document.querySelector('#street-section-right-empty-space').
      style[system.cssTransform] = 'translateX(' + (extraWidth / 2) + 'px)'
  } else {
    document.querySelector('#street-section-left-empty-space').
      style.marginLeft = -(extraWidth / 2) + 'px'
    document.querySelector('#street-section-right-empty-space').
      style.marginLeft = (extraWidth / 2) + 'px'
  }
}

function _nextSegmentVariant (dataNo) {
  var segment = street.segments[dataNo]

  var segmentInfo = SEGMENT_INFO[segment.type]

  var nextVariantString = ''
  var found = 0
  for (var i in segmentInfo.details) {
    if (found == 1) {
      nextVariantString = i
      break
    }
    if (i == segment.variantString) {
      found = 1
    }
  }

  if (!nextVariantString) {
    // TODO hack
    for (var i in segmentInfo.details) {
      nextVariantString = i
      break
    }
  }

  _changeSegmentVariant(dataNo, null, null, nextVariantString)
}

function _changeSegmentVariant (dataNo, variantName, variantChoice, variantString) {
  var segment = street.segments[dataNo]

  if (variantString) {
    segment.variantString = variantString
    segment.variant = _getVariantArray(segment.type, segment.variantString)
  } else {
    segment.variant[variantName] = variantChoice
    segment.variantString = _getVariantString(segment.variant)
  }

  var el = _createSegmentDom(segment)

  var oldEl = segment.el
  oldEl.parentNode.insertBefore(el, oldEl)
  _switchSegmentElAway(oldEl)

  segment.el = el
  segment.el.dataNo = oldEl.dataNo
  street.segments[oldEl.dataNo].el = el

  _switchSegmentElIn(el)
  el.classList.add('hover')
  el.classList.add('show-drag-handles')
  el.classList.add('immediate-show-drag-handles')
  el.classList.add('hide-drag-handles-when-inside-info-bubble')
  _infoBubble.segmentEl = el

  _infoBubble.updateContents()

  _repositionSegments()
  _recalculateWidth()
  _applyWarningsToSegments()

  _saveStreetToServerIfNecessary()
}

function _switchSegmentElIn (el) {
  el.classList.add('switching-in-pre')

  window.setTimeout(function () {
    var pos = _getElAbsolutePos(el)
    var perspective = -(pos[0] - document.querySelector('#street-section-outer').scrollLeft - system.viewportWidth / 2)
    // TODO const
    // TODO cross-browser

    el.style.webkitPerspectiveOrigin = (perspective / 2) + 'px 50%'
    el.style.MozPerspectiveOrigin = (perspective / 2) + 'px 50%'
    el.style.perspectiveOrigin = (perspective / 2) + 'px 50%'

    el.classList.add('switching-in-post')
  }, SEGMENT_SWITCHING_TIME / 2)

  window.setTimeout(function () {
    el.classList.remove('switching-in-pre')
    el.classList.remove('switching-in-post')
  }, SEGMENT_SWITCHING_TIME * 1.5)
}

function _switchSegmentElAway (el) {
  var pos = _getElAbsolutePos(el)

  // TODO func
  var perspective = -(pos[0] - document.querySelector('#street-section-outer').scrollLeft - system.viewportWidth / 2)
  // TODO const
  // TODO cross-browser

  el.style.webkitPerspectiveOrigin = (perspective / 2) + 'px 50%'
  el.style.MozPerspectiveOrigin = (perspective / 2) + 'px 50%'
  el.style.perspectiveOrigin = (perspective / 2) + 'px 50%'

  el.parentNode.removeChild(el)
  el.classList.remove('hover')
  el.classList.add('switching-away-pre')
  el.style.left = (pos[0] - document.querySelector('#street-section-outer').scrollLeft) + 'px'
  el.style.top = pos[1] + 'px'
  document.body.appendChild(el)

  window.setTimeout(function () {
    el.classList.add('switching-away-post')
  }, 0)

  window.setTimeout(function () {
    _removeElFromDom(el)
  }, SEGMENT_SWITCHING_TIME)
}

var _statusMessage = {
  timerId: -1,

  show: function (text, undo) {
    window.clearTimeout(_statusMessage.timerId)

    document.querySelector('#status-message > div').innerHTML = text

    if (undo) {
      var buttonEl = document.createElement('button')
      buttonEl.innerHTML = msg('BUTTON_UNDO')
      buttonEl.addEventListener('pointerdown', _undo)
      document.querySelector('#status-message > div').appendChild(buttonEl)
    }

    var el = document.createElement('button')
    el.classList.add('close')
    el.addEventListener('pointerdown', _onClickTheX)
    el.innerHTML = msg('UI_GLYPH_X')
    document.querySelector('#status-message > div').appendChild(el)

    document.querySelector('#status-message').classList.add('visible')

    _statusMessage.timerId =
      window.setTimeout(_statusMessage.hide, STATUS_MESSAGE_HIDE_DELAY)

    function _onClickTheX () {
      _statusMessage.hide()
      // Force window to refocus on document.body after status-message is closed by X button
      // Required on Chrome
      _loseAnyFocus()
    }
  },

  hide: function () {
    document.querySelector('#status-message').classList.remove('visible')
  }
}

function _hideEmptySegment (position) {
  document.querySelector('#street-section-' + position + '-empty-space').
    classList.remove('visible')
}

function _showEmptySegment (position, width) {
  document.querySelector('#street-section-' + position + '-empty-space .width').innerHTML =
    _prettifyWidth(width / TILE_SIZE, PRETTIFY_WIDTH_OUTPUT_MARKUP)
  document.querySelector('#street-section-' + position + '-empty-space').
    classList.add('visible')

  if (position == 'right') {
    width-- // So that the rules align
  }
  document.querySelector('#street-section-' + position + '-empty-space').
    style.width = width + 'px'
}

function _repositionEmptySegments () {
  if (street.remainingWidth <= 0) {
    _hideEmptySegment('left')
    _hideEmptySegment('right')
  } else {
    if (!street.occupiedWidth) {
      var width = street.remainingWidth * TILE_SIZE
      _showEmptySegment('left', width)
      _hideEmptySegment('right')
    } else {
      var width = street.remainingWidth / 2 * TILE_SIZE
      _showEmptySegment('left', width)
      _showEmptySegment('right', width)
    }
  }
}

function _segmentsChanged () {
  if (!initializing) {
    _createDataFromDom()
  }

  _recalculateWidth()
  //_recalculateOwnerWidths()

  for (var i in street.segments) {
    if (street.segments[i].el) {
      street.segments[i].el.dataNo = i
    }
  }

  _saveStreetToServerIfNecessary()
  _updateUndoButtons()
  _repositionSegments()

  printingNeedsUpdating = true
}
