var NEW_STREET_DEFAULT = 1
var NEW_STREET_EMPTY = 2

function _makeDefaultStreet () {
  ignoreStreetChanges = true
  _prepareDefaultStreet()
  _setUpdateTimeToNow()

  _resizeStreetWidth()
  _updateStreetName()
  _createDomFromData()
  _segmentsChanged()
  _updateShareMenu()

  ignoreStreetChanges = false
  lastStreet = _trimStreetData(street)

  _saveStreetToServer(false)
}

function _onNewStreetDefaultClick () {
  settings.newStreetPreference = NEW_STREET_DEFAULT
  _saveSettingsLocally()

  _makeDefaultStreet()
}

function _onNewStreetEmptyClick () {
  settings.newStreetPreference = NEW_STREET_EMPTY
  _saveSettingsLocally()

  ignoreStreetChanges = true
  _prepareEmptyStreet()

  _resizeStreetWidth()
  _updateStreetName()
  _createDomFromData()
  _segmentsChanged()
  _updateShareMenu()

  ignoreStreetChanges = false
  lastStreet = _trimStreetData(street)

  _saveStreetToServer(false)
}

function _onNewStreetLastClick () {
  _fetchLastStreet()
}
