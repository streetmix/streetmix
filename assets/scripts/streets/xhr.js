/* global API_URL, MODES, _processMode, app, mode, abortEverything,
   _propagateUnits, _checkIfEverythingIsLoaded */
/* global serverContacted */ // eslint-disable-line no-unused-vars

import $ from 'jquery'
import _ from 'lodash'

import { showError, ERRORS } from '../app/errors'
import { trackEvent } from '../app/event_tracking'
import { msg } from '../app/messages'
import { goNewStreet } from '../app/routing'
import { showStatusMessage } from '../app/status_message'
import { infoBubble } from '../info_bubble/info_bubble'
import { shareMenu } from '../menus/_share'
import { segmentsChanged } from '../segments/view'
import {
  getAuthHeader,
  getSignInData,
  isSignedIn
} from '../users/authentication'
import {
  saveSettingsLocally,
  confirmSaveStreetToServerInitial,
  saveSettingsToServer,
  getSettings
} from '../users/settings'
import {
  isblockingAjaxRequestInProgress,
  newBlockingAjaxRequest
} from '../util/fetch_blocking'
import {
  newNonblockingAjaxRequest,
  getNonblockingAjaxRequestCount
} from '../util/fetch_nonblocking'
import { NEW_STREET_EMPTY, makeDefaultStreet } from './creation'
import {
  prepareEmptyStreet,
  prepareDefaultStreet,
  getStreet,
  trimStreetData,
  updateEverything,
  createDomFromData,
  createDataFromDom,
  DEFAULT_NAME,
  setStreet,
  updateToLatestSchemaVersion,
  setStreetCreatorId,
  setUpdateTimeToNow,
  setLastStreet
} from './data_model'
import { updateStreetName } from './name'
import {
  getRemixOnFirstEdit,
  setRemixOnFirstEdit,
  remixStreet,
  addRemixSuffixToName
} from './remix'
import {
  setUndoStack,
  setUndoPosition,
  getUndoStack,
  FLAG_SAVE_UNDO,
  getUndoPosition,
  unifyUndoStack,
  setIgnoreStreetChanges
} from './undo_stack'
import { resizeStreetWidth } from './width'

const SAVE_STREET_DELAY = 500

var saveStreetTimerId = -1
let saveStreetIncomplete = false

export function getSaveStreetIncomplete () {
  return saveStreetIncomplete
}

export function setSaveStreetIncomplete (value) {
  saveStreetIncomplete = value
}

var uniqueRequestId = 0

var latestRequestId
var latestVerificationStreet

function getUniqueRequestHeader () {
  uniqueRequestId++
  return uniqueRequestId
}

export function createNewStreetOnServer () {
  if (getSettings().newStreetPreference === NEW_STREET_EMPTY) {
    prepareEmptyStreet()
  } else {
    prepareDefaultStreet()
  }

  var transmission = packServerStreetData()

  $.ajax({
    // TODO const
    url: API_URL + 'v1/streets',
    data: transmission,
    type: 'POST',
    dataType: 'json',
    headers: { 'Authorization': getAuthHeader() }
  }).done(receiveNewStreet)
    .fail(errorReceiveNewStreet)
}

function receiveNewStreet (data) {
  setStreetId(data.id, data.namespacedId)

  saveStreetToServer(true)
}

function errorReceiveNewStreet (data) {
  showError(ERRORS.NEW_STREET_SERVER_FAILURE, true)
}

export function getFetchStreetUrl () {
  // TODO const
  let url
  var street = getStreet()
  if (street.creatorId) {
    url = API_URL + 'v1/streets?namespacedId=' +
      encodeURIComponent(street.namespacedId) + '&creatorId=' +
      encodeURIComponent(street.creatorId)
  } else {
    url = API_URL + 'v1/streets?namespacedId=' +
      encodeURIComponent(street.namespacedId)
  }

  return url
}

export function fetchStreetFromServer () {
  var url = getFetchStreetUrl()

  window.fetch(url)
    .then(function (response) {
      return response.json()
    })
    .then(receiveStreet)
    .catch(errorReceiveStreet)
}

function errorReceiveStreet (data) {
  if ((mode === MODES.CONTINUE) || (mode === MODES.USER_GALLERY) ||
    (mode === MODES.ABOUT) || (mode === MODES.GLOBAL_GALLERY)) {
    goNewStreet()
  } else {
    if ((data.status === 404) || (data.status === 410)) {
      if (getStreet().creatorId) {
        if (data.status === 410) {
          mode = MODES.STREET_410_BUT_LINK_TO_USER // eslint-disable-line no-native-reassign
        } else {
          mode = MODES.STREET_404_BUT_LINK_TO_USER // eslint-disable-line no-native-reassign
        }
      } else {
        mode = MODES.STREET_404 // eslint-disable-line no-native-reassign
      }
      // TODO swap for showError (here and elsewhere)
      _processMode()
    } else {
      showError(ERRORS.NEW_STREET_SERVER_FAILURE, true)
    }
  }
}

export function saveStreetToServer (initial) {
  if (app.readOnly) {
    return
  }

  var transmission = packServerStreetData()
  var street = getStreet()

  if (initial) {
    // blocking
    $.ajax({
      // TODO const
      url: API_URL + 'v1/streets/' + street.id,
      data: transmission,
      dataType: 'json',
      type: 'PUT',
      contentType: 'application/json',
      headers: { 'Authorization': getAuthHeader() }
    }).done(confirmSaveStreetToServerInitial)
  } else {
    newNonblockingAjaxRequest({
      // TODO const
      url: API_URL + 'v1/streets/' + street.id,
      data: transmission,
      dataType: 'json',
      type: 'PUT',
      contentType: 'application/json',
      headers: { 'Authorization': getAuthHeader() }
    }, false)
  }
}

function clearScheduledSavingStreetToServer () {
  window.clearTimeout(saveStreetTimerId)
}

export function fetchStreetForVerification () {
  // Don’t do it with any network services pending
  if (getNonblockingAjaxRequestCount() || isblockingAjaxRequestInProgress() ||
    saveStreetIncomplete || abortEverything || getRemixOnFirstEdit()) {
    return
  }

  var url = getFetchStreetUrl()

  latestRequestId = getUniqueRequestHeader()
  latestVerificationStreet = trimStreetData(getStreet())

  $.ajax({
    url: url,
    dataType: 'json',
    type: 'GET',
    // TODO const
    headers: { 'X-Streetmix-Request-Id': latestRequestId }
  }).done(receiveStreetForVerification).fail(errorReceiveStreetForVerification)
}

function receiveStreetForVerification (transmission, textStatus, request) {
  var requestId = parseInt(request.getResponseHeader('X-Streetmix-Request-Id'))

  if (requestId !== latestRequestId) {
    return
  }

  var localStreetData = trimStreetData(latestVerificationStreet)
  var serverStreetData = trimStreetData(unpackStreetDataFromServerTransmission(transmission))

  if (JSON.stringify(localStreetData) !== JSON.stringify(serverStreetData)) {
    console.log('NOT EQUAL')
    console.log('-')
    console.log(JSON.stringify(localStreetData))
    console.log('-')
    console.log(JSON.stringify(serverStreetData))
    console.log('-')
    console.log(transmission)

    showStatusMessage(msg('STATUS_RELOADED_FROM_SERVER'))

    infoBubble.suppress()

    unpackServerStreetData(transmission, null, null, false)
    updateEverything(true)

    trackEvent('EVENT', 'STREET_MODIFIED_ELSEWHERE', null, null, false)
  }
}

function errorReceiveStreetForVerification (data) {
  // 404 should never happen here, since 410 designates streets that have
  // been deleted (but remain hidden on the server)

  if (isSignedIn() && ((data.status === 404) || (data.status === 410))) {
    showError(ERRORS.STREET_DELETED_ELSEWHERE, true)
  }
}

function receiveStreet (transmission) {
  unpackServerStreetData(transmission, null, null, true)

  _propagateUnits()

  // TODO this is stupid, only here to fill some structures
  createDomFromData()
  createDataFromDom()

  serverContacted = true // eslint-disable-line no-native-reassign
  _checkIfEverythingIsLoaded()
}

function unpackStreetDataFromServerTransmission (transmission) {
  // Catch a data error where a user's street might be retrieved
  // without any data in it (so-called error 9B)
  if (!transmission.data) {
    showError(ERRORS.STREET_DATA_FAILURE)
    return
  }

  var street = _.cloneDeep(transmission.data.street)

  street.creatorId = (transmission.creator && transmission.creator.id) || null
  street.originalStreetId = transmission.originalStreetId || null
  street.updatedAt = transmission.updatedAt || null
  street.name = transmission.name || DEFAULT_NAME

  // FIXME just read it and do 0 otherwise
  if (typeof transmission.data.street.editCount === 'undefined') {
    // console.log('editCount read is empty')
    street.editCount = null
  } else {
    street.editCount = transmission.data.street.editCount
  // console.log('editCount read is', street.editCount)
  }

  return street
}

export function unpackServerStreetData (transmission, id, namespacedId, checkIfNeedsToBeRemixed) {
  setStreet(unpackStreetDataFromServerTransmission(transmission))
  var street = getStreet()

  if (transmission.data.undoStack) {
    setUndoStack(_.cloneDeep(transmission.data.undoStack))
    setUndoPosition(transmission.data.undoPosition)
  } else {
    setUndoStack([])
    setUndoPosition(0)
  }

  var updatedSchema = updateToLatestSchemaVersion(street)
  var undoStack = getUndoStack()
  for (var i = 0; i < undoStack.length; i++) {
    if (updateToLatestSchemaVersion(undoStack[i])) {
      updatedSchema = true
    }
  }

  if (id) {
    setStreetId(id, namespacedId)
  } else {
    setStreetId(transmission.id, transmission.namespacedId)
  }

  if (checkIfNeedsToBeRemixed) {
    if (!isSignedIn() || (street.creatorId !== getSignInData().userId)) {
      setRemixOnFirstEdit(true)
    } else {
      setRemixOnFirstEdit(false)
    }

    if (updatedSchema && !getRemixOnFirstEdit()) {
      saveStreetToServer()
    }
  }
}

export function packServerStreetData () {
  var data = {}

  data.street = trimStreetData(getStreet())

  // Those go above data in the structure, so they need to be cleared here
  delete data.street.name
  delete data.street.originalStreetId
  delete data.street.updatedAt

  // This will be implied through authorization header
  delete data.street.creatorId

  if (FLAG_SAVE_UNDO) {
    data.undoStack = _.cloneDeep(getUndoStack())
    data.undoPosition = getUndoPosition()
  }

  var street = getStreet()
  var transmission = {
    name: street.name,
    originalStreetId: street.originalStreetId,
    data: data
  }

  return JSON.stringify(transmission)
}

export function setStreetId (newId, newNamespacedId) {
  var street = getStreet()
  street.id = newId
  street.namespacedId = newNamespacedId

  unifyUndoStack()

  updateLastStreetInfo()
}

export function updateLastStreetInfo () {
  var street = getStreet()
  let settings = getSettings()
  settings.lastStreetId = street.id
  settings.lastStreetNamespacedId = street.namespacedId
  settings.lastStreetCreatorId = street.creatorId

  saveSettingsLocally()
}

export function scheduleSavingStreetToServer () {
  saveStreetIncomplete = true

  clearScheduledSavingStreetToServer()

  if (getRemixOnFirstEdit()) {
    remixStreet()
  } else {
    saveStreetTimerId =
      window.setTimeout(function () { saveStreetToServer(false) }, SAVE_STREET_DELAY)
  }
}

export function fetchLastStreet () {
  newBlockingAjaxRequest(msg('LOADING'),
    {
      // TODO const
      url: API_URL + 'v1/streets/' + getSettings().priorLastStreetId,
      dataType: 'json',
      type: 'GET',
      headers: { 'Authorization': getAuthHeader() }
    }, receiveLastStreet, cancelReceiveLastStreet
  )
}

function cancelReceiveLastStreet () {
  document.querySelector('#new-street-default').checked = true
  makeDefaultStreet()
}

function receiveLastStreet (transmission) {
  setIgnoreStreetChanges(true)
  var street = getStreet()
  unpackServerStreetData(transmission, street.id, street.namespacedId, false)
  street.originalStreetId = getSettings().priorLastStreetId
  addRemixSuffixToName()

  if (isSignedIn()) {
    setStreetCreatorId(getSignInData().userId)
  } else {
    setStreetCreatorId(null)
  }
  setUpdateTimeToNow()
  street.editCount = 0
  // console.log('editCount = 0 on last street!')

  _propagateUnits()

  // TODO this is stupid, only here to fill some structures
  createDomFromData()
  createDataFromDom()

  unifyUndoStack()

  resizeStreetWidth()
  updateStreetName()
  createDomFromData()
  segmentsChanged()
  shareMenu.update()

  setIgnoreStreetChanges(false)
  setLastStreet(trimStreetData(street))

  saveStreetToServer(false)
}

export function sendDeleteStreetToServer (id) {
  // Prevents new street submenu from showing the last street
  let settings = getSettings()
  if (settings.lastStreetId === id) {
    settings.lastStreetId = null
    settings.lastStreetCreatorId = null
    settings.lastStreetNamespacedId = null

    saveSettingsLocally()
    saveSettingsToServer()
  }

  newNonblockingAjaxRequest({
    // TODO const
    url: API_URL + 'v1/streets/' + id,
    dataType: 'json',
    type: 'DELETE',
    headers: { 'Authorization': getAuthHeader() }
  }, false)
}
