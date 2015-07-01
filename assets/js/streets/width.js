var STREET_WIDTH_CUSTOM = -1
var STREET_WIDTH_SWITCH_TO_METRIC = -2
var STREET_WIDTH_SWITCH_TO_IMPERIAL = -3

var DEFAULT_STREET_WIDTH = 80
var DEFAULT_STREET_WIDTHS = [40, 60, 80]

var MIN_CUSTOM_STREET_WIDTH = 10
var MAX_CUSTOM_STREET_WIDTH = 400

function _onStreetWidthChange (event) {
  var el = event.target
  var newStreetWidth = el.value

  document.body.classList.remove('edit-street-width')

  if (newStreetWidth == street.width) {
    return
  } else if (newStreetWidth == STREET_WIDTH_SWITCH_TO_METRIC) {
    _updateUnits(SETTINGS_UNITS_METRIC)
    return
  } else if (newStreetWidth == STREET_WIDTH_SWITCH_TO_IMPERIAL) {
    _updateUnits(SETTINGS_UNITS_IMPERIAL)
    return
  } else if (newStreetWidth == STREET_WIDTH_CUSTOM) {
    _ignoreWindowFocusMomentarily()

    var promptValue = street.occupiedWidth
    if (promptValue < MIN_CUSTOM_STREET_WIDTH) promptValue = MIN_CUSTOM_STREET_WIDTH
    if (promptValue > MAX_CUSTOM_STREET_WIDTH) promptValue = MAX_CUSTOM_STREET_WIDTH

    // TODO string
    var width = prompt(
      msg('PROMPT_NEW_STREET_WIDTH', {
        minWidth: _prettifyWidth(MIN_CUSTOM_STREET_WIDTH, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP),
        maxWidth: _prettifyWidth(MAX_CUSTOM_STREET_WIDTH, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP)
      }), _prettifyWidth(promptValue, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP))

    if (width) {
      width = _normalizeStreetWidth(_processWidthInput(width))
    }

    if (!width) {
      _buildStreetWidthMenu()

      _loseAnyFocus()
      return
    }

    if (width < MIN_CUSTOM_STREET_WIDTH) {
      width = MIN_CUSTOM_STREET_WIDTH
    } else if (width > MAX_CUSTOM_STREET_WIDTH) {
      width = MAX_CUSTOM_STREET_WIDTH
    }
    newStreetWidth = width
  }

  street.width = _normalizeStreetWidth(newStreetWidth)
  _buildStreetWidthMenu()
  _resizeStreetWidth()

  initializing = true

  _createDomFromData()
  _segmentsChanged()

  initializing = false

  _loseAnyFocus()
}

function _createStreetWidthOption (width) {
  var el = document.createElement('option')
  el.value = width
  el.innerHTML = _prettifyWidth(width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP)
  return el
}

function _buildStreetWidthMenu () {
  document.querySelector('#street-width').innerHTML = ''

  var el = document.createElement('option')
  el.disabled = true
  el.innerHTML = 'Occupied width:'
  document.querySelector('#street-width').appendChild(el)

  var el = document.createElement('option')
  el.disabled = true
  el.innerHTML = _prettifyWidth(street.occupiedWidth, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP)
  document.querySelector('#street-width').appendChild(el)

  var el = document.createElement('option')
  el.disabled = true
  document.querySelector('#street-width').appendChild(el)

  var el = document.createElement('option')
  el.disabled = true
  el.innerHTML = 'Building-to-building width:'
  document.querySelector('#street-width').appendChild(el)

  var widths = []

  for (var i in DEFAULT_STREET_WIDTHS) {
    var width = _normalizeStreetWidth(DEFAULT_STREET_WIDTHS[i])
    var el = _createStreetWidthOption(width)
    document.querySelector('#street-width').appendChild(el)

    widths.push(width)
  }

  if (widths.indexOf(parseFloat(street.width)) == -1) {
    var el = document.createElement('option')
    el.disabled = true
    document.querySelector('#street-width').appendChild(el)

    var el = _createStreetWidthOption(street.width)
    document.querySelector('#street-width').appendChild(el)
  }

  var el = document.createElement('option')
  el.value = STREET_WIDTH_CUSTOM
  el.innerHTML = 'Different width…'
  document.querySelector('#street-width').appendChild(el)

  var el = document.createElement('option')
  el.disabled = true
  document.querySelector('#street-width').appendChild(el)

  var el = document.createElement('option')
  el.value = STREET_WIDTH_SWITCH_TO_IMPERIAL
  el.id = 'switch-to-imperial-units'
  el.innerHTML = msg('MENU_SWITCH_TO_IMPERIAL')
  if (street.units == SETTINGS_UNITS_IMPERIAL) {
    el.disabled = true
  }
  document.querySelector('#street-width').appendChild(el)

  var el = document.createElement('option')
  el.value = STREET_WIDTH_SWITCH_TO_METRIC
  el.id = 'switch-to-metric-units'
  el.innerHTML = msg('MENU_SWITCH_TO_METRIC')
  if (street.units == SETTINGS_UNITS_METRIC) {
    el.disabled = true
  }

  document.querySelector('#street-width').appendChild(el)

  document.querySelector('#street-width').value = street.width
}

function _onStreetWidthClick (event) {
  document.body.classList.add('edit-street-width')

  document.querySelector('#street-width').focus()

  window.setTimeout(function () {
    var trigger = document.createEvent('MouseEvents')
    trigger.initEvent('mousedown', true, true, window)
    document.querySelector('#street-width').dispatchEvent(trigger)
  }, 0)
}

function _resizeStreetWidth (dontScroll) {
  var width = street.width * TILE_SIZE

  document.querySelector('#street-section-canvas').style.width = width + 'px'
  if (!dontScroll) {
    document.querySelector('#street-section-outer').scrollLeft =
      (width + BUILDING_SPACE * 2 - system.viewportWidth) / 2
    _onStreetSectionScroll()
  }

  _onResize()
}

function _normalizeStreetWidth (width) {
  if (width < MIN_CUSTOM_STREET_WIDTH) {
    width = MIN_CUSTOM_STREET_WIDTH
  } else if (width > MAX_CUSTOM_STREET_WIDTH) {
    width = MAX_CUSTOM_STREET_WIDTH
  }

  var resolution = segmentWidthResolution
  width = Math.round(width / resolution) * resolution

  return width
}

function _recalculateOccupiedWidth () {
  street.occupiedWidth = 0

  for (var i in street.segments) {
    var segment = street.segments[i]

    street.occupiedWidth += segment.width
  }

  street.remainingWidth = street.width - street.occupiedWidth
  // Rounding problems :·(
  if (Math.abs(street.remainingWidth) < WIDTH_ROUNDING) {
    street.remainingWidth = 0
  }

  _buildStreetWidthMenu()
  _updateStreetMetadata()
}

function _recalculateWidth () {
  _recalculateOccupiedWidth()

  var position = street.width / 2 - street.occupiedWidth / 2

  for (var i in street.segments) {
    var segment = street.segments[i]
    var segmentInfo = SEGMENT_INFO[segment.type]
    var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString]

    if (segment.el) {
      if ((street.remainingWidth < 0) &&
        ((position < 0) || ((position + segment.width) > street.width))) {
        segment.warnings[SEGMENT_WARNING_OUTSIDE] = true
      } else {
        segment.warnings[SEGMENT_WARNING_OUTSIDE] = false
      }

      if (variantInfo.minWidth && (segment.width < variantInfo.minWidth)) {
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = true
      } else {
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = false
      }

      if (variantInfo.maxWidth && (segment.width > variantInfo.maxWidth)) {
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = true
      } else {
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = false
      }
    }

    position += street.segments[i].width
  }

  var lastOverflow = document.body.classList.contains('street-overflows')

  if (street.remainingWidth >= 0) {
    document.body.classList.remove('street-overflows')
  } else {
    document.body.classList.add('street-overflows')
  }

  if (lastOverflow != document.body.classList.contains('street-overflows')) {
    _createBuildings()
  }

  _repositionEmptySegments()

  _applyWarningsToSegments()
}
