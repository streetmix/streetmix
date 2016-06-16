/* global app, signedIn, signInData, API_URL, _getAuthHeader,
   URL_SIGN_IN_REDIRECT */

import { msg } from '../app/messages'
import { showStatusMessage } from '../app/status_message'
import { newBlockingAjaxRequest } from '../util/fetch_blocking'
import { setStreetCreatorId, getStreet } from './data_model'
import { updateStreetName } from './name'
import { getUndoStack, getUndoPosition, unifyUndoStack } from './undo_stack'
import { saveStreetToServer, packServerStreetData, setStreetId } from './xhr'

const STREET_NAME_REMIX_SUFFIX = '(remix)'
let remixOnFirstEdit = false

export function getRemixOnFirstEdit () {
  return remixOnFirstEdit
}

export function setRemixOnFirstEdit (value) {
  remixOnFirstEdit = value
}

// Auto “promote” (remix) the street if you just signed in and the street
// was anonymous
let promoteStreet = false

export function getPromoteStreet () {
  return promoteStreet
}

export function setPromoteStreet (value) {
  promoteStreet = value
}

export function remixStreet () {
  let dontAddSuffix
  if (app.readOnly) {
    return
  }

  remixOnFirstEdit = false

  if (signedIn) {
    setStreetCreatorId(signInData.userId)
  } else {
    setStreetCreatorId(null)
  }
  var street = getStreet()
  street.originalStreetId = street.id
  street.editCount = 0

  unifyUndoStack()

  var undoStack = getUndoStack()
  var undoPosition = getUndoPosition()
  if (undoStack[undoPosition - 1] && (undoStack[undoPosition - 1].name !== street.name)) {
    // The street was remixed as a result of editing its name. Don’t be
    // a douche and add (remixed) to it then.
    dontAddSuffix = true
  } else {
    dontAddSuffix = false
  }

  if (!promoteStreet && !dontAddSuffix) {
    addRemixSuffixToName()
  }

  var transmission = packServerStreetData()

  newBlockingAjaxRequest(msg('BLOCKING_REMIXING'),
    {
      // TODO const
      url: API_URL + 'v1/streets',
      type: 'POST',
      data: transmission,
      dataType: 'json',
      contentType: 'application/json',
      headers: { 'Authorization': _getAuthHeader() }
    }, receiveRemixedStreet
  )
}

function receiveRemixedStreet (data) {
  if (!promoteStreet) {
    if (signedIn) {
      showStatusMessage(msg('STATUS_NOW_REMIXING'))
    } else {
      showStatusMessage(msg('STATUS_NOW_REMIXING_SIGN_IN', { signInUrl: URL_SIGN_IN_REDIRECT }))
    }
  }

  setStreetId(data.id, data.namespacedId)
  updateStreetName()

  saveStreetToServer(false)
}

export function addRemixSuffixToName () {
  var street = getStreet()
  if (street.name.substr(street.name.length - STREET_NAME_REMIX_SUFFIX.length,
      STREET_NAME_REMIX_SUFFIX.length) !== STREET_NAME_REMIX_SUFFIX) {
    street.name += ' ' + STREET_NAME_REMIX_SUFFIX
  }
}
