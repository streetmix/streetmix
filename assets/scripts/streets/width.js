/* global prompt, system */
/* global initializing */ // eslint-disable-line no-unused-vars

import { loseAnyFocus } from '../app/focus'
import { msg } from '../app/messages'
import { onResize } from '../app/window_resize'
import { BUILDING_SPACE, createBuildings } from '../segments/buildings'
import { SEGMENT_INFO } from '../segments/info'
import { getSegmentWidthResolution } from '../segments/resizing'
import { TILE_SIZE, segmentsChanged } from '../segments/view'
import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC,
  updateUnits
} from '../users/localization'
import { processWidthInput, prettifyWidth } from '../util/width_units'
import { getStreet, createDomFromData } from './data_model'
import { updateStreetMetadata } from './metadata'
import { onStreetSectionScroll } from './scroll'

const STREET_WIDTH_CUSTOM = -1
const STREET_WIDTH_SWITCH_TO_METRIC = -2
const STREET_WIDTH_SWITCH_TO_IMPERIAL = -3

export const DEFAULT_STREET_WIDTH = 80
const DEFAULT_STREET_WIDTHS = [40, 60, 80]

const MIN_CUSTOM_STREET_WIDTH = 10
export const MAX_CUSTOM_STREET_WIDTH = 400

const WIDTH_ROUNDING = 0.01

export const SEGMENT_WARNING_OUTSIDE = 1
export const SEGMENT_WARNING_WIDTH_TOO_SMALL = 2
export const SEGMENT_WARNING_WIDTH_TOO_LARGE = 3

export function onStreetWidthChange (event) {
  var el = event.target
  var newStreetWidth = parseInt(el.value)
  var street = getStreet()

  document.body.classList.remove('edit-street-width')
  if (newStreetWidth === street.width) {
    return
  } else if (newStreetWidth === STREET_WIDTH_SWITCH_TO_METRIC) {
    updateUnits(SETTINGS_UNITS_METRIC)
    return
  } else if (newStreetWidth === STREET_WIDTH_SWITCH_TO_IMPERIAL) {
    updateUnits(SETTINGS_UNITS_IMPERIAL)
    return
  } else if (newStreetWidth === STREET_WIDTH_CUSTOM) {
    var promptValue = street.occupiedWidth
    if (promptValue < MIN_CUSTOM_STREET_WIDTH) promptValue = MIN_CUSTOM_STREET_WIDTH
    if (promptValue > MAX_CUSTOM_STREET_WIDTH) promptValue = MAX_CUSTOM_STREET_WIDTH

    // TODO string
    var width = prompt(
      msg('PROMPT_NEW_STREET_WIDTH', {
        minWidth: prettifyWidth(MIN_CUSTOM_STREET_WIDTH),
        maxWidth: prettifyWidth(MAX_CUSTOM_STREET_WIDTH)
      }), prettifyWidth(promptValue))

    if (width) {
      width = normalizeStreetWidth(processWidthInput(width))
    }

    if (!width) {
      buildStreetWidthMenu()

      loseAnyFocus()
      return
    }

    if (width < MIN_CUSTOM_STREET_WIDTH) {
      width = MIN_CUSTOM_STREET_WIDTH
    } else if (width > MAX_CUSTOM_STREET_WIDTH) {
      width = MAX_CUSTOM_STREET_WIDTH
    }
    newStreetWidth = width
  }

  street.width = normalizeStreetWidth(newStreetWidth)
  buildStreetWidthMenu()
  resizeStreetWidth()

  initializing = true // eslint-disable-line no-native-reassign

  createDomFromData()
  segmentsChanged()

  initializing = false // eslint-disable-line no-native-reassign

  loseAnyFocus()
}

function createStreetWidthOption (width) {
  var el = document.createElement('option')
  el.value = width
  el.innerHTML = prettifyWidth(width)
  return el
}

export function buildStreetWidthMenu () {
  let el
  document.querySelector('#street-width').innerHTML = ''

  el = document.createElement('option')
  el.disabled = true
  el.innerHTML = 'Occupied width:'
  document.querySelector('#street-width').appendChild(el)

  var street = getStreet()
  el = document.createElement('option')
  el.disabled = true
  el.innerHTML = prettifyWidth(street.occupiedWidth)
  document.querySelector('#street-width').appendChild(el)

  el = document.createElement('option')
  el.disabled = true
  document.querySelector('#street-width').appendChild(el)

  el = document.createElement('option')
  el.disabled = true
  el.innerHTML = 'Building-to-building width:'
  document.querySelector('#street-width').appendChild(el)

  var widths = []

  for (var i in DEFAULT_STREET_WIDTHS) {
    var width = normalizeStreetWidth(DEFAULT_STREET_WIDTHS[i])
    el = createStreetWidthOption(width)
    document.querySelector('#street-width').appendChild(el)

    widths.push(width)
  }

  if (widths.indexOf(parseFloat(street.width)) === -1) {
    el = document.createElement('option')
    el.disabled = true
    document.querySelector('#street-width').appendChild(el)

    el = createStreetWidthOption(street.width)
    document.querySelector('#street-width').appendChild(el)
  }

  el = document.createElement('option')
  el.value = STREET_WIDTH_CUSTOM
  el.innerHTML = 'Different width…'
  document.querySelector('#street-width').appendChild(el)

  el = document.createElement('option')
  el.disabled = true
  document.querySelector('#street-width').appendChild(el)

  el = document.createElement('option')
  el.value = STREET_WIDTH_SWITCH_TO_IMPERIAL
  el.id = 'switch-to-imperial-units'
  el.innerHTML = msg('MENU_SWITCH_TO_IMPERIAL')
  if (street.units === SETTINGS_UNITS_IMPERIAL) {
    el.disabled = true
  }
  document.querySelector('#street-width').appendChild(el)

  el = document.createElement('option')
  el.value = STREET_WIDTH_SWITCH_TO_METRIC
  el.id = 'switch-to-metric-units'
  el.innerHTML = msg('MENU_SWITCH_TO_METRIC')
  if (street.units === SETTINGS_UNITS_METRIC) {
    el.disabled = true
  }

  document.querySelector('#street-width').appendChild(el)

  document.querySelector('#street-width').value = street.width
}

export function onStreetWidthClick (event) {
  document.body.classList.add('edit-street-width')

  document.querySelector('#street-width').focus()

  window.setTimeout(function () {
    var trigger = document.createEvent('MouseEvents')
    trigger.initEvent('mousedown', true, true, window)
    document.querySelector('#street-width').dispatchEvent(trigger)
  }, 0)
}

export function resizeStreetWidth (dontScroll) {
  var width = getStreet().width * TILE_SIZE

  document.querySelector('#street-section-canvas').style.width = width + 'px'
  if (!dontScroll) {
    document.querySelector('#street-section-outer').scrollLeft =
      (width + BUILDING_SPACE * 2 - system.viewportWidth) / 2
    onStreetSectionScroll()
  }

  onResize()
}

export function normalizeStreetWidth (width) {
  if (width < MIN_CUSTOM_STREET_WIDTH) {
    width = MIN_CUSTOM_STREET_WIDTH
  } else if (width > MAX_CUSTOM_STREET_WIDTH) {
    width = MAX_CUSTOM_STREET_WIDTH
  }

  var resolution = getSegmentWidthResolution()
  width = Math.round(width / resolution) * resolution

  return width
}

export function recalculateOccupiedWidth () {
  var street = getStreet()
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

  buildStreetWidthMenu()
  updateStreetMetadata(street)
}

export function recalculateWidth () {
  recalculateOccupiedWidth()

  var street = getStreet()
  var position = street.width / 2 - street.occupiedWidth / 2

  for (var i in street.segments) {
    var segment = street.segments[i]
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

  if (lastOverflow !== document.body.classList.contains('street-overflows')) {
    createBuildings()
  }
}
