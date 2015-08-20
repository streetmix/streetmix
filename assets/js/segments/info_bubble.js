var TRACK_ACTION_LEARN_MORE = 'Learn more about segment'

var INFO_BUBBLE_MARGIN_BUBBLE = 20
var INFO_BUBBLE_MARGIN_MOUSE = 10

var INFO_BUBBLE_TYPE_SEGMENT = 1
var INFO_BUBBLE_TYPE_LEFT_BUILDING = 2
var INFO_BUBBLE_TYPE_RIGHT_BUILDING = 3

var TOUCH_CONTROLS_FADEOUT_TIME = 3000;
var TOUCH_CONTROLS_FADEOUT_DELAY = 3000;

var _infoBubble = {
  mouseInside: false,

  visible: false,
  el: null,

  descriptionVisible: false,

  startMouseX: null,
  startMouseY: null,
  hoverPolygon: null,
  segmentEl: null,
  type: null,

  lastMouseX: null,
  lastMouseY: null,

  suppressed: false,

  bubbleX: null,
  bubbleY: null,
  bubbleWidth: null,
  bubbleHeight: null,

  considerMouseX: null,
  considerMouseY: null,
  considerSegmentEl: null,
  considerType: null,

  hoverPolygonUpdateTimerId: -1,
  suppressTimerId: -1,

  suppress: function () {
    if (!_infoBubble.suppressed) {
      _infoBubble.hide()
      _infoBubble.hideSegment(true)
      // _infoBubble.el.classList.add('suppressed')
      _infoBubble.suppressed = true
    }

    window.clearTimeout(_infoBubble.suppressTimerId)
    _infoBubble.suppressTimerId = window.setTimeout(_infoBubble.unsuppress, 100)
  },

  unsuppress: function () {
    // _infoBubble.el.classList.remove('suppressed')
    _infoBubble.suppressed = false

    window.clearTimeout(_infoBubble.suppressTimerId)
  },

  onTouchStart: function () {
    _resumeFadeoutControls()
  },

  onMouseEnter: function () {
    if (_infoBubble.segmentEl) {
      _infoBubble.segmentEl.classList.add('hide-drag-handles-when-inside-info-bubble')
    }

    _infoBubble.mouseInside = true

    _infoBubble.updateHoverPolygon()
  },

  onMouseLeave: function (event) {
    // Prevent pointer taps from flashing the drag handles
    if (event.pointerType === 'mouse') {
      if (_infoBubble.segmentEl) {
        _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-inside-info-bubble')
      }
    }

    _infoBubble.mouseInside = false
  },

  _withinHoverPolygon: function (x, y) {
    return _isPointInPoly(_infoBubble.hoverPolygon, [x, y])
  },

  updateHoverPolygon: function (mouseX, mouseY) {
    if (!_infoBubble.visible) {
      _infoBubble.hideDebugHoverPolygon()
      return
    }

    var bubbleX = _infoBubble.bubbleX
    var bubbleY = _infoBubble.bubbleY
    var bubbleWidth = _infoBubble.bubbleWidth
    var bubbleHeight = _infoBubble.bubbleHeight

    if (_infoBubble.descriptionVisible) {
      // TODO const
      var marginBubble = 200
    } else {
      var marginBubble = INFO_BUBBLE_MARGIN_BUBBLE
    }

    if (_infoBubble.mouseInside && !_infoBubble.descriptionVisible) {
      var pos = _getElAbsolutePos(_infoBubble.segmentEl)

      var x = pos[0] - document.querySelector('#street-section-outer').scrollLeft

      var segmentX1 = x - INFO_BUBBLE_MARGIN_BUBBLE
      var segmentX2 = x + _infoBubble.segmentEl.offsetWidth + INFO_BUBBLE_MARGIN_BUBBLE

      var segmentY = pos[1] + _infoBubble.segmentEl.offsetHeight + INFO_BUBBLE_MARGIN_BUBBLE

      _infoBubble.hoverPolygon = [
        [bubbleX - marginBubble, bubbleY - marginBubble],
        [bubbleX - marginBubble, bubbleY + bubbleHeight + marginBubble],
        [segmentX1, bubbleY + bubbleHeight + marginBubble + 120],
        [segmentX1, segmentY],
        [segmentX2, segmentY],
        [segmentX2, bubbleY + bubbleHeight + marginBubble + 120],
        [bubbleX + bubbleWidth + marginBubble, bubbleY + bubbleHeight + marginBubble],
        [bubbleX + bubbleWidth + marginBubble, bubbleY - marginBubble],
        [bubbleX - marginBubble, bubbleY - marginBubble]
      ]
    } else {
      var bottomY = mouseY - INFO_BUBBLE_MARGIN_MOUSE
      if (bottomY < bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE) {
        bottomY = bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE
      }
      var bottomY2 = mouseY + INFO_BUBBLE_MARGIN_MOUSE
      if (bottomY2 < bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE) {
        bottomY2 = bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE
      }

      if (_infoBubble.descriptionVisible) {
        bottomY = bubbleY + bubbleHeight + marginBubble
        bottomY2 = bottomY
      }

      var diffX = 60 - (mouseY - bubbleY) / 5
      if (diffX < 0) {
        diffX = 0
      } else if (diffX > 50) {
        diffX = 50
      }

      _infoBubble.hoverPolygon = [
        [bubbleX - marginBubble, bubbleY - marginBubble],
        [bubbleX - marginBubble, bubbleY + bubbleHeight + marginBubble],
        [(bubbleX - marginBubble + mouseX - INFO_BUBBLE_MARGIN_MOUSE - diffX) / 2, bottomY + (bubbleY + bubbleHeight + marginBubble - bottomY) * .2],
        [mouseX - INFO_BUBBLE_MARGIN_MOUSE - diffX, bottomY],
        [mouseX - INFO_BUBBLE_MARGIN_MOUSE, bottomY2],
        [mouseX + INFO_BUBBLE_MARGIN_MOUSE, bottomY2],
        [mouseX + INFO_BUBBLE_MARGIN_MOUSE + diffX, bottomY],
        [(bubbleX + bubbleWidth + marginBubble + mouseX + INFO_BUBBLE_MARGIN_MOUSE + diffX) / 2, bottomY + (bubbleY + bubbleHeight + marginBubble - bottomY) * .2],
        [bubbleX + bubbleWidth + marginBubble, bubbleY + bubbleHeight + marginBubble],
        [bubbleX + bubbleWidth + marginBubble, bubbleY - marginBubble],
        [bubbleX - marginBubble, bubbleY - marginBubble]
      ]
    }

    _infoBubble.drawDebugHoverPolygon()
  },

  hideDebugHoverPolygon: function () {
    if (!debug.hoverPolygon) {
      return
    }

    var el = document.querySelector('#debug-hover-polygon canvas')

    el.width = el.width // clear
  },

  drawDebugHoverPolygon: function () {
    if (!debug.hoverPolygon) {
      return
    }

    _infoBubble.hideDebugHoverPolygon()
    var el = document.querySelector('#debug-hover-polygon canvas')

    var ctx = el.getContext('2d')
    ctx.strokeStyle = 'red'
    ctx.fillStyle = 'rgba(255, 0, 0, .1)'
    ctx.beginPath()
    ctx.moveTo(_infoBubble.hoverPolygon[0][0], _infoBubble.hoverPolygon[0][1])
    for (var i = 1; i < _infoBubble.hoverPolygon.length; i++) {
      ctx.lineTo(_infoBubble.hoverPolygon[i][0], _infoBubble.hoverPolygon[i][1])
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  },

  scheduleHoverPolygonUpdate: function () {
    window.clearTimeout(_infoBubble.hoverPolygonUpdateTimerId)

    _infoBubble.hoverPolygonUpdateTimerId = window.setTimeout(function () {
      _infoBubble.updateHoverPolygon(_infoBubble.lastMouseX, _infoBubble.lastMouseY)
    }, 50)
  },

  onBodyMouseMove: function (event) {
    var mouseX = event.pageX
    var mouseY = event.pageY

    _infoBubble.lastMouseX = mouseX
    _infoBubble.lastMouseY = mouseY

    if (_infoBubble.visible) {
      if (!_infoBubble._withinHoverPolygon(mouseX, mouseY)) {
        _infoBubble.show(false)
      }
    }

    _infoBubble.scheduleHoverPolygonUpdate()
  },

  hideSegment: function (fast) {
    if (_infoBubble.segmentEl) {
      _infoBubble.segmentEl.classList.remove('hover')
      var el = _infoBubble.segmentEl
      if (fast) {
        el.classList.add('immediate-show-drag-handles')
        window.setTimeout(function () {
          el.classList.remove('immediate-show-drag-handles')
        }, 0)
      } else {
        el.classList.remove('immediate-show-drag-handles')
      }
      _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown')
      _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-inside-info-bubble')
      _infoBubble.segmentEl.classList.remove('show-drag-handles')
      _infoBubble.segmentEl = null
    }
  },

  hide: function () {
    _infoBubble.mouseInside = false

    if (_infoBubble.descriptionVisible) {
      _infoBubble.descriptionVisible = false
      _infoBubble.el.classList.remove('show-description')
      if (_infoBubble.segmentEl) {
        _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown')
      }
    }

    if (_infoBubble.el) {
      document.body.classList.remove('controls-fade-out')

      _infoBubble.el.classList.remove('visible')
      _infoBubble.visible = false

      document.body.removeEventListener('mousemove', _infoBubble.onBodyMouseMove)
    }
  },

  considerShowing: function (event, segmentEl, type) {
    if (MenuManager.isVisible() === true || readOnly) {
      return
    }

    if (event) {
      _infoBubble.considerMouseX = event.pageX
      _infoBubble.considerMouseY = event.pageY
    } else {
      var pos = _getElAbsolutePos(segmentEl)

      _infoBubble.considerMouseX = pos[0] - document.querySelector('#street-section-outer').scrollLeft
      _infoBubble.considerMouseY = pos[1]
    }
    _infoBubble.considerSegmentEl = segmentEl
    _infoBubble.considerType = type

    if ((segmentEl == _infoBubble.segmentEl) && (type == _infoBubble.type)) {
      return
    }

    if (!_infoBubble.visible || !_infoBubble._withinHoverPolygon(_infoBubble.considerMouseX, _infoBubble.considerMouseY)) {
      _infoBubble.show(false)
    }
  },

  dontConsiderShowing: function () {
    _infoBubble.considerSegmentEl = null
    _infoBubble.considerType = null
  },

  onBuildingVariantButtonClick: function (event, left, variantChoice) {
    var side

    if (left) {
      street.leftBuildingVariant = variantChoice
      side = 'left'
    } else {
      street.rightBuildingVariant = variantChoice
      side = 'right'
    }

    var el = document.querySelector('#street-section-' + side + '-building')
    el.id = 'street-section-' + side + '-building-old'

    var newEl = document.createElement('div')
    newEl.className = 'street-section-building'
    newEl.id = 'street-section-' + side + '-building'

    el.parentNode.appendChild(newEl)
    _updateBuildingPosition()
    _switchSegmentElIn(newEl)
    _switchSegmentElAway(el)

    // TODO repeat
    newEl.addEventListener('pointerenter', _onBuildingMouseEnter)
    newEl.addEventListener('pointerleave', _onBuildingMouseEnter)

    _saveStreetToServerIfNecessary()
    _createBuildings()

    _infoBubble.updateContents()
  },

  getBubbleDimensions: function () {
    _infoBubble.bubbleWidth = _infoBubble.el.offsetWidth

    if (_infoBubble.descriptionVisible) {
      var el = _infoBubble.el.querySelector('.description-canvas')
      var pos = _getElAbsolutePos(el)
      _infoBubble.bubbleHeight = pos[1] + el.offsetHeight - 38
    } else {
      _infoBubble.bubbleHeight = _infoBubble.el.offsetHeight
    }

    var height = _infoBubble.bubbleHeight + 30

    _infoBubble.el.style.webkitTransformOrigin = '50% ' + height + 'px'
    _infoBubble.el.style.MozTransformOrigin = '50% ' + height + 'px'
    _infoBubble.el.style.transformOrigin = '50% ' + height + 'px'
  },

  updateDescriptionInContents: function (segment) {
    if (!_infoBubble.segmentEl || !segment || !segment.el ||
      (_infoBubble.segmentEl != segment.el)) {
      return
    }

    var segmentInfo = SEGMENT_INFO[segment.type]
    var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString]

    _removeElFromDom(_infoBubble.el.querySelector('.description-prompt'))
    _removeElFromDom(_infoBubble.el.querySelector('.description-canvas'))

    var description = ''
    if (variantInfo && variantInfo.description) {
      var description = variantInfo.description
    } else if (segmentInfo && segmentInfo.description) {
      var description = segmentInfo.description
    }

    if (description) {
      var el = document.createElement('div')
      el.classList.add('description-prompt')
      el.innerHTML = (description.prompt) ? description.prompt : 'Learn more'

      el.addEventListener('pointerdown', _infoBubble.showDescription)
      el.addEventListener('pointerenter', _infoBubble.highlightTriangle)
      el.addEventListener('pointerleave', _infoBubble.unhighlightTriangle)

      _infoBubble.el.appendChild(el)

      var el = document.createElement('div')
      el.classList.add('description-canvas')

      var innerEl = document.createElement('div')
      innerEl.classList.add('description')
      if (description.image) {
        innerEl.innerHTML += '<img src="/images/info-bubble-examples/' + description.image + '">'
      }
      if (description.lede) {
        innerEl.innerHTML += '<p class="lede">' + description.lede + '</p>'
      }
      for (var i = 0; i < description.text.length; i++) {
        innerEl.innerHTML += '<p>' + description.text[i] + '</p>'
      }
      if (description.imageCaption) {
        innerEl.innerHTML += '<footer>Photo: ' + description.imageCaption + '</footer>'
      }
      el.appendChild(innerEl)

      var els = innerEl.querySelectorAll('a')
      for (var i = 0, anchorEl; anchorEl = els[i]; i++) {
        anchorEl.target = '_blank'
      }

      var innerEl = document.createElement('div')
      innerEl.classList.add('description-close')
      innerEl.innerHTML = 'Close'
      innerEl.addEventListener('pointerdown', _infoBubble.hideDescription)
      innerEl.addEventListener('pointerenter', _infoBubble.highlightTriangle)
      innerEl.addEventListener('pointerleave', _infoBubble.unhighlightTriangle)

      el.appendChild(innerEl)

      var innerEl = document.createElement('div')
      innerEl.classList.add('triangle')
      el.appendChild(innerEl)

      _infoBubble.el.appendChild(el)
    }
  },

  updateWarningsInContents: function (segment) {
    if (!_infoBubble.segmentEl || !segment || !segment.el ||
      (_infoBubble.segmentEl != segment.el)) {
      return
    }
    var el = _infoBubble.el.querySelector('.warnings')

    var html = ''

    if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
      html += '<p>'
      html += msg('WARNING_DOESNT_FIT')
      html += '</p>'
    }
    if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL]) {
      html += '<p>'
      html += msg('WARNING_NOT_WIDE_ENOUGH')
      html += '</p>'
    }
    if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]) {
      html += '<p>'
      html += msg('WARNING_TOO_WIDE')
      html += '</p>'
    }

    if (html) {
      el.innerHTML = html
      el.classList.add('visible')
    } else {
      el.classList.remove('visible')
    }

    _infoBubble.getBubbleDimensions()
  },

  updateHeightButtonsInContents: function () {
    var height = (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ? street.leftBuildingHeight : street.rightBuildingHeight
    var variant = (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ? street.leftBuildingVariant : street.rightBuildingVariant

    if (!_isFlooredBuilding(variant) || (height == 1)) {
      _infoBubble.el.querySelector('.non-variant .decrement').disabled = true
    } else {
      _infoBubble.el.querySelector('.non-variant .decrement').disabled = false
    }

    if (!_isFlooredBuilding(variant) || (height == MAX_BUILDING_HEIGHT)) {
      _infoBubble.el.querySelector('.non-variant .increment').disabled = true
    } else {
      _infoBubble.el.querySelector('.non-variant .increment').disabled = false
    }
  },

  updateWidthButtonsInContents: function (width) {
    if (width == MIN_SEGMENT_WIDTH) {
      _infoBubble.el.querySelector('.non-variant .decrement').disabled = true
    } else {
      _infoBubble.el.querySelector('.non-variant .decrement').disabled = false
    }

    if (width == MAX_SEGMENT_WIDTH) {
      _infoBubble.el.querySelector('.non-variant .increment').disabled = true
    } else {
      _infoBubble.el.querySelector('.non-variant .increment').disabled = false
    }
  },

  updateHeightInContents: function (left) {
    if (!_infoBubble.visible ||
      (left && (_infoBubble.type != INFO_BUBBLE_TYPE_LEFT_BUILDING)) ||
      (!left && (_infoBubble.type != INFO_BUBBLE_TYPE_RIGHT_BUILDING))) {
      return
    }

    var height = left ? street.leftBuildingHeight : street.rightBuildingHeight
    var variant = left ? street.leftBuildingVariant : street.rightBuildingVariant

    _infoBubble.updateHeightButtonsInContents()

    if (_isFlooredBuilding(variant)) {
      var el = _infoBubble.el.querySelector('.non-variant .height')
      if (el) {
        el.realValue = height
        el.value = _prettifyHeight(height, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP)
      } else {
        var el = _infoBubble.el.querySelector('.non-variant .height-non-editable')
        el.innerHTML = _prettifyHeight(height, PRETTIFY_WIDTH_OUTPUT_MARKUP)
      }
    }
  },

  updateWidthInContents: function (segmentEl, width) {
    if (!_infoBubble.visible || !_infoBubble.segmentEl ||
      (_infoBubble.segmentEl != segmentEl)) {
      return
    }

    _infoBubble.updateWidthButtonsInContents(width)

    var el = _infoBubble.el.querySelector('.non-variant .width')
    if (el) {
      el.realValue = width
      el.value = _prettifyWidth(width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP)
    } else {
      var el = _infoBubble.el.querySelector('.non-variant .width-non-editable')
      el.innerHTML = _prettifyWidth(width, PRETTIFY_WIDTH_OUTPUT_MARKUP)
    }
  },

  createVariantIcon: function (name, buttonEl) {
    var variantIcon = VARIANT_ICONS[name]

    if (variantIcon) {
      var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svgEl.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'http://www.w3.org/1999/svg')
      svgEl.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink')
      if (svgEl.classList) {
        svgEl.classList.add('icon')
      } else {
        // Internet Explorer does not have the .classList methods on SVGElements
        svgEl.setAttribute('class', 'icon')
      }

      if (variantIcon.color) {
        svgEl.style.fill = variantIcon.color
      }

      var useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use')
      useEl.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#icon-' + variantIcon.id)

      buttonEl.appendChild(svgEl)
      svgEl.appendChild(useEl)

      if (variantIcon.title) {
        buttonEl.title = variantIcon.title
      }
    }
  },

  updateContents: function () {
    var infoBubbleEl = _infoBubble.el

    // If info bubble changes, wake this back up if it's fading out
    _cancelFadeoutControls()

    switch (_infoBubble.type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        var segment = street.segments[parseInt(_infoBubble.segmentEl.dataNo)]
        var segmentInfo = SEGMENT_INFO[segment.type]
        var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString]
        var name = variantInfo.name || segmentInfo.name

        // var name = segmentInfo.name
        var canBeDeleted = true
        var showWidth = true
        var showVariants = true

        _infoBubble.el.setAttribute('type', 'segment')
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
        var name = BUILDING_VARIANT_NAMES[BUILDING_VARIANTS.indexOf(street.leftBuildingVariant)]
        var canBeDeleted = false
        var showWidth = false
        var showVariants = false

        _infoBubble.el.setAttribute('type', 'building')
        break
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        var name = BUILDING_VARIANT_NAMES[BUILDING_VARIANTS.indexOf(street.rightBuildingVariant)]
        var canBeDeleted = false
        var showWidth = false
        var showVariants = false

        _infoBubble.el.setAttribute('type', 'building')
        break
    }

    infoBubbleEl.innerHTML = ''

    var triangleEl = document.createElement('div')
    triangleEl.classList.add('triangle')
    infoBubbleEl.appendChild(triangleEl)

    // Header

    var headerEl = document.createElement('header')

    headerEl.innerHTML = name

    if (canBeDeleted) {
      var innerEl = document.createElement('button')
      innerEl.classList.add('remove')
      innerEl.innerHTML = 'Remove'
      // _infoBubble.createVariantIcon('trashcan', innerEl)
      innerEl.segmentEl = _infoBubble.segmentEl
      innerEl.tabIndex = -1
      innerEl.setAttribute('title', msg('TOOLTIP_REMOVE_SEGMENT'))
      innerEl.addEventListener('pointerdown', _onRemoveButtonClick)
      headerEl.appendChild(innerEl)
    }

    infoBubbleEl.appendChild(headerEl)

    // Building height canvas

    if ((_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ||
      (_infoBubble.type == INFO_BUBBLE_TYPE_RIGHT_BUILDING)) {
      if (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) {
        var variant = street.leftBuildingVariant
        var height = street.leftBuildingHeight
      } else {
        var variant = street.rightBuildingVariant
        var height = street.rightBuildingHeight
      }

      var disabled = !_isFlooredBuilding(variant)

      var widthCanvasEl = document.createElement('div')
      widthCanvasEl.classList.add('non-variant')
      widthCanvasEl.classList.add('building-height')

      var innerEl = document.createElement('button')
      innerEl.classList.add('increment')
      innerEl.innerHTML = '+'
      innerEl.tabIndex = -1
      innerEl.title = msg('TOOLTIP_ADD_FLOOR')
      var func = function () {
        _changeBuildingHeight(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING, true)
      }

      innerEl.addEventListener('pointerdown', func)

      widthCanvasEl.appendChild(innerEl)
      if (!system.touch) {
        var innerEl = document.createElement('input')
        innerEl.setAttribute('type', 'text')
        innerEl.classList.add('height')
        innerEl.title = msg('TOOLTIP_BUILDING_HEIGHT')

        innerEl.addEventListener('pointerdown', _onWidthHeightEditClick)
        innerEl.addEventListener('focus', _onHeightEditFocus)
        innerEl.addEventListener('blur', _onHeightEditBlur)
        innerEl.addEventListener('input', _onHeightEditInput)
        innerEl.addEventListener('mouseover', _onWidthHeightEditMouseOver)
        innerEl.addEventListener('mouseout', _onWidthHeightEditMouseOut)
        innerEl.addEventListener('keydown', _onHeightEditKeyDown)
      } else {
        var innerEl = document.createElement('span')
        innerEl.classList.add('height-non-editable')
      }
      if (disabled) {
        innerEl.disabled = true
      }
      widthCanvasEl.appendChild(innerEl)

      var innerEl = document.createElement('button')
      innerEl.classList.add('decrement')
      innerEl.innerHTML = '–'
      innerEl.tabIndex = -1
      innerEl.title = msg('TOOLTIP_REMOVE_FLOOR')
      var func = function () {
        _changeBuildingHeight(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING, false)
      }
      innerEl.addEventListener('pointerdown', func)

      widthCanvasEl.appendChild(innerEl)
      infoBubbleEl.appendChild(widthCanvasEl)
    }

    // Width canvas

    if (showWidth) {
      var widthCanvasEl = document.createElement('div')
      widthCanvasEl.classList.add('non-variant')

      if (!segmentInfo.variants[0]) {
        widthCanvasEl.classList.add('entire-info-bubble')
      }

      var innerEl = document.createElement('button')
      innerEl.classList.add('decrement')
      innerEl.innerHTML = '–'
      innerEl.segmentEl = segment.el
      innerEl.title = msg('TOOLTIP_DECREASE_WIDTH')
      innerEl.tabIndex = -1
      innerEl.addEventListener('pointerdown', _onWidthDecrementClick)
      widthCanvasEl.appendChild(innerEl)

      if (!system.touch) {
        var innerEl = document.createElement('input')
        innerEl.setAttribute('type', 'text')
        innerEl.classList.add('width')
        innerEl.title = msg('TOOLTIP_SEGMENT_WIDTH')
        innerEl.segmentEl = segment.el

        innerEl.addEventListener('pointerdown', _onWidthHeightEditClick)
        innerEl.addEventListener('focus', _onWidthEditFocus)
        innerEl.addEventListener('blur', _onWidthEditBlur)
        innerEl.addEventListener('input', _onWidthEditInput)
        innerEl.addEventListener('mouseover', _onWidthHeightEditMouseOver)
        innerEl.addEventListener('mouseout', _onWidthHeightEditMouseOut)
        innerEl.addEventListener('keydown', _onWidthEditKeyDown)
      } else {
        var innerEl = document.createElement('span')
        innerEl.classList.add('width-non-editable')
      }
      widthCanvasEl.appendChild(innerEl)

      var innerEl = document.createElement('button')
      innerEl.classList.add('increment')
      innerEl.innerHTML = '+'
      innerEl.segmentEl = segment.el
      innerEl.tabIndex = -1
      innerEl.title = msg('TOOLTIP_INCREASE_WIDTH')
      innerEl.addEventListener('pointerdown', _onWidthIncrementClick)
      widthCanvasEl.appendChild(innerEl)

      infoBubbleEl.appendChild(widthCanvasEl)
    }

    // Variants

    var variantsEl = document.createElement('div')
    variantsEl.classList.add('variants')

    switch (_infoBubble.type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        var first = true

        for (var i in segmentInfo.variants) {
          if (!first) {
            var el = document.createElement('hr')
            variantsEl.appendChild(el)
          } else {
            first = false
          }

          for (var j in VARIANTS[segmentInfo.variants[i]]) {
            var variantName = segmentInfo.variants[i]
            var variantChoice = VARIANTS[segmentInfo.variants[i]][j]

            var el = document.createElement('button')
            _infoBubble.createVariantIcon(variantName + VARIANT_SEPARATOR + variantChoice, el)

            if (segment.variant[variantName] == variantChoice) {
              el.disabled = true
            }

            el.addEventListener('pointerdown', (function (dataNo, variantName, variantChoice) {
              return function () {
                _changeSegmentVariant(dataNo, variantName, variantChoice)
              }
            })(segment.el.dataNo, variantName, variantChoice))

            variantsEl.appendChild(el)
          }
        }
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        if (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) {
          var variant = street.leftBuildingVariant
        } else {
          var variant = street.rightBuildingVariant
        }

        for (var j in BUILDING_VARIANTS) {
          var el = document.createElement('button')
          // TODO const
          _infoBubble.createVariantIcon('building' + VARIANT_SEPARATOR + BUILDING_VARIANTS[j], el)
          if (BUILDING_VARIANTS[j] == variant) {
            el.disabled = true
          }

          variantsEl.appendChild(el)

          el.addEventListener('pointerdown', (function (left, variantChoice) {
            return function () {
              _infoBubble.onBuildingVariantButtonClick(null, left, variantChoice)
            }
          })(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING, BUILDING_VARIANTS[j]))
        }

        break
    }

    infoBubbleEl.appendChild(variantsEl)

    // Warnings

    var el = document.createElement('div')
    el.classList.add('warnings')

    infoBubbleEl.appendChild(el)

    _infoBubble.updateDescriptionInContents(segment)
    _infoBubble.updateWarningsInContents(segment)
    window.setTimeout(function () {
      if (_infoBubble.type == INFO_BUBBLE_TYPE_SEGMENT) {
        _infoBubble.updateWidthInContents(segment.el, segment.width)
      } else {
        _infoBubble.updateHeightInContents(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING)
      }
    }, 0)
  },

  highlightTriangle: function () {
    _infoBubble.el.classList.add('highlight-triangle')
  },

  unhighlightTriangle: function () {
    _infoBubble.el.classList.remove('highlight-triangle')
  },

  unhighlightTriangleDelayed: function () {
    window.setTimeout(function () { _infoBubble.unhighlightTriangle(); }, 200)
  },

  showDescription: function () {
    _infoBubble.descriptionVisible = true

    var el = _infoBubble.el.querySelector('.description-canvas')
    el.style.height = (streetSectionTop + 200 + 50 - _infoBubble.bubbleY) + 'px'

    _infoBubble.el.classList.add('show-description')
    if (_infoBubble.segmentEl) {
      _infoBubble.segmentEl.classList.add('hide-drag-handles-when-description-shown')
    }
    _infoBubble.unhighlightTriangleDelayed()
    window.setTimeout(function () {
      _infoBubble.getBubbleDimensions()
      _infoBubble.updateHoverPolygon()
    }, 500)

    var segment = street.segments[parseInt(_infoBubble.segmentEl.dataNo)]
    EventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_LEARN_MORE,
      segment.type, null, false)
  },

  hideDescription: function () {
    _infoBubble.descriptionVisible = false
    _infoBubble.el.classList.remove('show-description')
    if (_infoBubble.segmentEl) {
      _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown')
    }

    _infoBubble.getBubbleDimensions()
    _infoBubble.unhighlightTriangleDelayed()
    _infoBubble.updateHoverPolygon()
  },

  // TODO rename
  show: function (force) {
    if (_infoBubble.suppressed) {
      window.setTimeout(_infoBubble.show, 100)
      return
    }

    if (draggingType != DRAGGING_TYPE_NONE) {
      return
    }

    if (!_infoBubble.considerType) {
      _infoBubble.hide()
      _infoBubble.hideSegment(false)
      return
    }

    var segmentEl = _infoBubble.considerSegmentEl
    var type = _infoBubble.considerType

    if ((segmentEl == _infoBubble.segmentEl) &&
      (type == _infoBubble.type) && !force) {
      return
    }
    _infoBubble.hideSegment(true)

    var mouseX = _infoBubble.considerMouseX
    var mouseY = _infoBubble.considerMouseY

    _infoBubble.segmentEl = segmentEl
    _infoBubble.type = type

    if (segmentEl) {
      segmentEl.classList.add('hover')
      segmentEl.classList.add('show-drag-handles')
    }
    if (_infoBubble.visible) {
      segmentEl.classList.add('immediate-show-drag-handles')

      if (_infoBubble.descriptionVisible) {
        _infoBubble.descriptionVisible = false
        _infoBubble.el.classList.remove('show-description')
        if (_infoBubble.segmentEl) {
          _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown')
        }
      }
    }

    _infoBubble.startMouseX = mouseX
    _infoBubble.startMouseY = mouseY

    var pos = _getElAbsolutePos(segmentEl)
    var bubbleX = pos[0] - document.querySelector('#street-section-outer').scrollLeft
    var bubbleY = pos[1]

    _infoBubble.el = document.querySelector('#main-screen .info-bubble')
    _infoBubble.updateContents()

    var bubbleWidth = _infoBubble.el.offsetWidth
    var bubbleHeight = _infoBubble.el.offsetHeight

    // TODO const
    bubbleY -= bubbleHeight - 20
    if (bubbleY < 50) {
      bubbleY = 50
    }

    bubbleX += segmentEl.offsetWidth / 2
    bubbleX -= bubbleWidth / 2

    // TODO const
    if (bubbleX < 50) {
      bubbleX = 50
    } else if (bubbleX > system.viewportWidth - bubbleWidth - 50) {
      bubbleX = system.viewportWidth - bubbleWidth - 50
    }

    _infoBubble.el.style.left = bubbleX + 'px'
    _infoBubble.el.style.top = bubbleY + 'px'

    if (!_infoBubble.visible) {
      _infoBubble.visible = true

    }
    _infoBubble.el.classList.add('visible')

    _infoBubble.bubbleX = bubbleX
    _infoBubble.bubbleY = bubbleY
    _infoBubble.bubbleWidth = bubbleWidth
    _infoBubble.bubbleHeight = bubbleHeight

    _infoBubble.updateHoverPolygon(mouseX, mouseY)
    document.body.addEventListener('mousemove', _infoBubble.onBodyMouseMove)
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

function _onSegmentMouseEnter (event) {
  if (suppressMouseEnter) {
    return
  }

  _infoBubble.considerShowing(event, this, INFO_BUBBLE_TYPE_SEGMENT)
}

function _onSegmentMouseLeave () {
  _infoBubble.dontConsiderShowing()
}
