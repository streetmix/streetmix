function _fetchGalleryData () {
  if (galleryUserId) {
    $.ajax({
      // TODO const
      url: API_URL + 'v1/users/' + galleryUserId + '/streets',
      dataType: 'json',
      type: 'GET',
      headers: { 'Authorization': _getAuthHeader() }
    }).done(_receiveGalleryData).fail(_errorReceiveGalleryData)
  } else {
    $.ajax({
      // TODO const
      url: API_URL + 'v1/streets?count=200',
      dataType: 'json',
      type: 'GET'
    }).done(_receiveGalleryData).fail(_errorReceiveGalleryData)
  }
}

function _errorReceiveGalleryData (data) {
  if ((mode == MODES.USER_GALLERY) && (data.status == 404)) {
    mode = MODES.NOT_FOUND
    _processMode()
    _hideGallery(true)
  } else {
    document.querySelector('#gallery .loading').classList.remove('visible')
    document.querySelector('#gallery .error-loading').classList.add('visible')
  }
}

function _fetchGalleryStreet (streetId) {
  showBlockingShield()

  $.ajax({
    // TODO const
    url: API_URL + 'v1/streets/' + streetId,
    dataType: 'json',
    type: 'GET',
    headers: { 'Authorization': _getAuthHeader() }
  }).done(_receiveGalleryStreet)
    .fail(_errorReceiveGalleryStreet)
}

function _errorReceiveGalleryStreet () {
  hideBlockingShield()
  galleryStreetLoaded = true
  galleryStreetId = street.id

  _updateGallerySelection()
}

// TODO similar to receiveLastStreet
function _receiveGalleryStreet (transmission) {
  if (transmission.id != galleryStreetId) {
    return
  }

  galleryStreetLoaded = true

  hideBlockingShield()

  ignoreStreetChanges = true

  _hideError()

  _unpackServerStreetData(transmission, null, null, true)

  _propagateUnits()

  _recalculateOccupiedWidth()

  // TODO this is stupid, only here to fill some structures
  _createDomFromData()
  _createDataFromDom()

  // Some parts of the UI need to know this happened to respond to it
  window.dispatchEvent(new CustomEvent('stmx:receive_gallery_street'))

  _resizeStreetWidth()
  _updateStreetName()
  _createDomFromData()
  _segmentsChanged()
  shareMenu.update()

  ignoreStreetChanges = false
  lastStreet = _trimStreetData(street)
}
