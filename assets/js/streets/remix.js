var STREET_NAME_REMIX_SUFFIX = '(remix)'
var remixOnFirstEdit = false

// Auto “promote” (remix) the street if you just signed in and the street
// was anonymous
var promoteStreet = false

function _remixStreet () {
  if (readOnly) {
    return
  }

  remixOnFirstEdit = false

  if (signedIn) {
    _setStreetCreatorId(signInData.userId)
  } else {
    _setStreetCreatorId(null)
  }

  street.originalStreetId = street.id
  street.editCount = 0
  // console.log('editCount = 0 on remix!')

  _unifyUndoStack()

  if (undoStack[undoPosition - 1] && (undoStack[undoPosition - 1].name != street.name)) {
    // The street was remixed as a result of editing its name. Don’t be
    // a douche and add (remixed) to it then.
    var dontAddSuffix = true
  } else {
    var dontAddSuffix = false
  }

  if (!promoteStreet && !dontAddSuffix) {
    _addRemixSuffixToName()
  }

  var transmission = _packServerStreetData()

  _newBlockingAjaxRequest(msg('BLOCKING_REMIXING'),
    {
      // TODO const
      url: API_URL + 'v1/streets',
      type: 'POST',
      data: transmission,
      dataType: 'json',
      contentType: 'application/json',
      headers: { 'Authorization': _getAuthHeader() }
    }, _receiveRemixedStreet
  )
}

function _receiveRemixedStreet (data) {
  if (!promoteStreet) {
    if (signedIn) {
      _statusMessage.show(msg('STATUS_NOW_REMIXING'))
    } else {
      _statusMessage.show(msg('STATUS_NOW_REMIXING_SIGN_IN', { signInUrl: URL_SIGN_IN_REDIRECT }))
    }
  }

  _setStreetId(data.id, data.namespacedId)
  _updateStreetName()

  _saveStreetToServer(false)
}

function _addRemixSuffixToName () {
  if (street.name.substr(street.name.length - STREET_NAME_REMIX_SUFFIX.length,
      STREET_NAME_REMIX_SUFFIX.length) != STREET_NAME_REMIX_SUFFIX) {
    street.name += ' ' + STREET_NAME_REMIX_SUFFIX
  }
}

