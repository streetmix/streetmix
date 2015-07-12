var TRACK_ACTION_ERROR_GEOLOCATION_TIMEOUT = 'Geolocation timeout'

var IP_GEOLOCATION_API_URL = 'http://freegeoip.net/json/'
var IP_GEOLOCATION_TIMEOUT = 1000; // After this time, we don’t wait any more

var units = SETTINGS_UNITS_IMPERIAL

var leftHandTraffic = false

var COUNTRIES_LEFT_HAND_TRAFFIC =
['AI', 'AG', 'AU', 'BS', 'BD', 'BB', 'BM', 'BT', 'BW', 'BN',
  'KY', 'CX', 'CC', 'CK', 'CY', 'DM', 'TL', 'FK', 'FJ', 'GD', 'GG',
  'GY', 'HK', 'IN', 'ID', 'IE', 'IM', 'JM', 'JP', 'JE', 'KE', 'KI',
  'LS', 'MO', 'MW', 'MY', 'MV', 'MT', 'MU', 'MS', 'MZ', 'NA', 'NR',
  'NP', 'NZ', 'NU', 'NF', 'PK', 'PG', 'PN', 'SH', 'KN', 'LC', 'VC',
  'WS', 'SC', 'SG', 'SB', 'ZA', 'LK', 'SR', 'SZ', 'TZ', 'TH', 'TK',
  'TO', 'TT', 'TC', 'TV', 'UG', 'GB', 'VG', 'VI', 'ZM', 'ZW']

var geolocationLoaded

function _checkIfSignInAndGeolocationLoaded () {
  if (geolocationLoaded && signInLoaded) {
    switch (mode) {
      case MODES.NEW_STREET:
      case MODES.NEW_STREET_COPY_LAST:
        if (readOnly) {
          _showError(ERRORS.CANNOT_CREATE_NEW_STREET_ON_PHONE, true)
        } else {
          _createNewStreetOnServer()
        }
        break
    }
  }
}

function _detectGeolocation () {
  geolocationLoaded = false

  $.ajax({ url: IP_GEOLOCATION_API_URL }).done(_receiveGeolocation)

  window.setTimeout(_detectGeolocationTimeout, IP_GEOLOCATION_TIMEOUT)
}

function _detectGeolocationTimeout () {
  if (!geolocationLoaded) {
    geolocationLoaded = true
    document.querySelector('#loading-progress').value++
    _checkIfSignInAndGeolocationLoaded()
    _checkIfEverythingIsLoaded()

    EventTracking.track(TRACK_CATEGORY_ERROR, TRACK_ACTION_ERROR_GEOLOCATION_TIMEOUT,
      null, null, false)
  }
}

function _updateSettingsFromCountryCode (countryCode) {
  if (COUNTRIES_IMPERIAL_UNITS.indexOf(countryCode) != -1) {
    units = SETTINGS_UNITS_IMPERIAL
  } else {
    units = SETTINGS_UNITS_METRIC
  }

  if (COUNTRIES_LEFT_HAND_TRAFFIC.indexOf(countryCode) != -1) {
    leftHandTraffic = true
  }

  if (debug.forceLeftHandTraffic) {
    leftHandTraffic = true
  }
  if (debug.forceMetric) {
    units = SETTINGS_UNITS_METRIC
  }
}

function _receiveGeolocation (info) {
  if (geolocationLoaded) {
    // Timed out, discard results
    return
  }

  if (info && info.country_code) {
    _updateSettingsFromCountryCode(info.country_code)
  }
  if (info && info.ip) {
    system.ipAddress = info.ip
  }

  geolocationLoaded = true
  document.querySelector('#loading-progress').value++
  _checkIfSignInAndGeolocationLoaded()
  _checkIfEverythingIsLoaded()
}

function _updateUnits (newUnits) {
  if (street.units == newUnits) {
    return
  }

  units = newUnits
  street.units = newUnits

  // If the user converts and then straight converts back, we just reach
  // to undo stack instead of double conversion (which could be lossy).
  if (undoStack[undoPosition - 1] &&
    (undoStack[undoPosition - 1].units == newUnits)) {
    var fromUndo = true
  } else {
    var fromUndo = false
  }

  _propagateUnits()

  ignoreStreetChanges = true
  if (!fromUndo) {
    _normalizeAllSegmentWidths()

    if (street.remainingWidth == 0) {
      street.width = 0
      for (var i in street.segments) {
        street.width += street.segments[i].width
      }
    } else {
      street.width = _normalizeStreetWidth(street.width)
    }
  } else {
    street = _clone(undoStack[undoPosition - 1])
  }
  _createDomFromData()
  _segmentsChanged()
  _resizeStreetWidth()

  ignoreStreetChanges = false

  _buildStreetWidthMenu()
  MenuManager.hideAll()

  _saveStreetToServerIfNecessary()
  _saveSettingsLocally()
}

function _propagateUnits () {
  switch (street.units) {
    case SETTINGS_UNITS_IMPERIAL:
      segmentWidthResolution = SEGMENT_WIDTH_RESOLUTION_IMPERIAL
      segmentWidthClickIncrement = SEGMENT_WIDTH_CLICK_INCREMENT_IMPERIAL
      segmentWidthDraggingResolution =
        SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL

      document.body.classList.add('units-imperial')
      document.body.classList.remove('units-metric')

      break
    case SETTINGS_UNITS_METRIC:
      segmentWidthResolution = SEGMENT_WIDTH_RESOLUTION_METRIC
      segmentWidthClickIncrement = SEGMENT_WIDTH_CLICK_INCREMENT_METRIC
      segmentWidthDraggingResolution =
        SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC

      document.body.classList.add('units-metric')
      document.body.classList.remove('units-imperial')

      break
  }

  _buildStreetWidthMenu()
}
