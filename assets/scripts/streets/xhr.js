import { cloneDeep } from 'lodash'
import { API_URL } from '../app/config'
import { showError, ERRORS } from '../app/errors'
import {
  checkIfEverythingIsLoaded,
  setServerContacted
} from '../app/initialization'
import { t } from '../locales/locale'
import { MODES, processMode, getMode, setMode } from '../app/mode'
import { goNewStreet } from '../app/routing'
import { showStatusMessage } from '../app/status_message'
import { infoBubble } from '../info_bubble/info_bubble'
import { app } from '../preinit/app_settings'
import { segmentsChanged } from '../segments/view'
import {
  getAuthHeader,
  getSignInData,
  isSignedIn
} from '../users/authentication'
import {
  confirmSaveStreetToServerInitial,
  saveSettingsToServer,
  getSettings,
  setSettings
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
  trimStreetData,
  updateEverything,
  updateToLatestSchemaVersion,
  setStreetCreatorId,
  setUpdateTimeToNow,
  setLastStreet,
  setIgnoreStreetChanges
} from './data_model'
import {
  getRemixOnFirstEdit,
  setRemixOnFirstEdit,
  remixStreet,
  addRemixSuffixToName
} from './remix'
import {
  getUndoStack,
  unifyUndoStack
} from './undo_stack'
import { resetUndoStack, replaceUndoStack } from '../store/actions/undo'
import store from '../store'
import {
  saveStreetId,
  saveOriginalStreetId,
  updateEditCount,
  updateStreetData
} from '../store/actions/street'
import { deleteStreetThumbnail } from './image'

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

  const options = {
    method: 'POST',
    body: packServerStreetData(),
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json'
    }
  }

  // TODO const url
  window.fetch(API_URL + 'v1/streets', options)
    .then(response => {
      if (!response.ok) {
        throw response
      }
      return response.json()
    })
    .then(receiveNewStreet)
    .catch(errorReceiveNewStreet)
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
  const street = store.getState().street
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
    .then(response => response.json())
    .catch(errorReceiveStreet)
    .then(receiveStreet)
}

function errorReceiveStreet (data) {
  let mode = getMode()
  if ((mode === MODES.CONTINUE) || (mode === MODES.USER_GALLERY) ||
    (mode === MODES.GLOBAL_GALLERY)) {
    goNewStreet()
  } else {
    if ((data.status === 404) || (data.status === 410)) {
      if (store.getState().street.creatorId) {
        if (data.status === 410) {
          setMode(MODES.STREET_410_BUT_LINK_TO_USER)
        } else {
          setMode(MODES.STREET_404_BUT_LINK_TO_USER)
        }
      } else {
        setMode(MODES.STREET_404)
      }
      // TODO swap for showError (here and elsewhere)
      processMode()
    } else {
      showError(ERRORS.NEW_STREET_SERVER_FAILURE, true)
    }
  }
}

export function saveStreetToServer (initial) {
  if (app.readOnly) {
    return
  }

  const transmission = packServerStreetData()
  const street = store.getState().street
  const url = API_URL + 'v1/streets/' + street.id
  const options = {
    method: 'PUT',
    body: transmission,
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json'
    }
  }

  if (initial) {
    // blocking
    window.fetch(url, options)
      .then(confirmSaveStreetToServerInitial)
  } else {
    newNonblockingAjaxRequest(url, options, false)
  }
}

function clearScheduledSavingStreetToServer () {
  window.clearTimeout(saveStreetTimerId)
}

export function fetchStreetForVerification () {
  // Don’t do it with any network services pending
  if (getNonblockingAjaxRequestCount() || isblockingAjaxRequestInProgress() ||
    saveStreetIncomplete || store.getState().errors.abortEverything || getRemixOnFirstEdit()) {
    return
  }

  const url = getFetchStreetUrl()

  latestRequestId = getUniqueRequestHeader()

  const options = {
    headers: { 'X-Streetmix-Request-Id': latestRequestId }
  }

  window.fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw response
      }

      const requestId = parseInt(response.headers.get('X-Streetmix-Request-Id'), 10)

      if (requestId !== latestRequestId) {
        throw new Error('1')
      } else {
        return response.json()
      }
    })
    .then(transmission => {
      receiveStreetForVerification(transmission)
    })
    .catch(error => {
      // Early exit if requestId does not equal the latestRequestId
      if (error.message !== '1') return

      errorReceiveStreetForVerification(error)
    })
}

/**
 * Compares the street data locally to the street data received from the server.
 * If the local copy is outdated, then we replace it with the updated data.
 *
 * @param {Object} transmission - server data
 */
function receiveStreetForVerification (transmission) {
  const localUpdatedAt = new Date(store.getState().street.updatedAt)
  const serverUpdatedAt = new Date(transmission.updatedAt)

  if (serverUpdatedAt > localUpdatedAt) {
    showStatusMessage(t('toast.reloaded', 'Your street was reloaded from the server as it was modified elsewhere.'))

    infoBubble.suppress()

    unpackServerStreetData(transmission, null, null, false)

    // Update everything, but don't re-save the street to the server,
    // which will re-invalidate the local copy.
    updateEverything(true, false)
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

  setServerContacted(true)

  // Legacy - remove once everything is Promise-based.
  checkIfEverythingIsLoaded()
}

function unpackStreetDataFromServerTransmission (transmission) {
  // Catch a data error where a user's street might be retrieved
  // without any data in it (so-called error 9B)
  if (!transmission.data) {
    showError(ERRORS.STREET_DATA_FAILURE)
    return
  }

  const street = cloneDeep(transmission.data.street)
  street.creatorId = (transmission.creator && transmission.creator.id) || null
  street.originalStreetId = transmission.originalStreetId || null
  street.updatedAt = transmission.updatedAt || null
  street.name = transmission.name || null
  street.location = transmission.data.street.location || null

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
  const street = unpackStreetDataFromServerTransmission(transmission)

  var updatedSchema = updateToLatestSchemaVersion(street)
  var undoStack = getUndoStack()
  for (var i = 0; i < undoStack.length; i++) {
    if (updateToLatestSchemaVersion(undoStack[i])) {
      updatedSchema = true
    }
  }

  store.dispatch(updateStreetData(street))

  if (transmission.data.undoStack) {
    store.dispatch(replaceUndoStack(cloneDeep(transmission.data.undoStack), transmission.data.undoPosition))
  } else {
    store.dispatch(resetUndoStack())
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
  data.street = trimStreetData(store.getState().street, false)

  // Those go above data in the structure, so they need to be cleared here
  delete data.street.name
  delete data.street.originalStreetId
  delete data.street.updatedAt

  // This will be implied through authorization header
  delete data.street.creatorId

  if (store.getState().flags.SAVE_UNDO.value === true) {
    data.undoStack = cloneDeep(store.getState().undo.stack)
    data.undoPosition = store.getState().undo.position
  }

  const street = store.getState().street
  var transmission = {
    name: street.name,
    originalStreetId: street.originalStreetId,
    data: data
  }

  return JSON.stringify(transmission)
}

export function setStreetId (newId, newNamespacedId) {
  store.dispatch(saveStreetId(newId, newNamespacedId))

  unifyUndoStack()
  updateLastStreetInfo()
}

export function updateLastStreetInfo () {
  const street = store.getState().street
  setSettings({
    lastStreetId: street.id,
    lastStreetNamespacedId: street.namespacedId,
    lastStreetCreatorId: street.creatorId
  })
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
  newBlockingAjaxRequest('load',
    {
      // TODO const
      url: API_URL + 'v1/streets/' + getSettings().priorLastStreetId,
      method: 'GET',
      headers: { 'Authorization': getAuthHeader() }
    }, receiveLastStreet, cancelReceiveLastStreet
  )
}

function cancelReceiveLastStreet () {
  makeDefaultStreet()
}

function receiveLastStreet (transmission) {
  setIgnoreStreetChanges(true)
  const street = store.getState().street
  unpackServerStreetData(transmission, street.id, street.namespacedId, false)
  store.dispatch(saveOriginalStreetId(getSettings().priorLastStreetId))
  addRemixSuffixToName()

  if (isSignedIn()) {
    setStreetCreatorId(getSignInData().userId)
  } else {
    setStreetCreatorId(null)
  }
  setUpdateTimeToNow()
  store.dispatch(updateEditCount(0))
  // console.log('editCount = 0 on last street!')

  // COMMENT - update street state to change originalStreetId above;
  // now have to update again to change edit count - how to fix?
  unifyUndoStack()

  segmentsChanged()

  setIgnoreStreetChanges(false)
  setLastStreet()

  saveStreetToServer(false)
}

export function sendDeleteStreetToServer (id) {
  // Delete street thumbnail.
  deleteStreetThumbnail(id)

  // Prevents new street submenu from showing the last street
  const settings = getSettings()
  if (settings.lastStreetId === id) {
    setSettings({
      lastStreetId: null,
      lastStreetCreatorId: null,
      lastStreetNamespacedId: null
    })

    saveSettingsToServer()
  }

  // TODO const url
  newNonblockingAjaxRequest(API_URL + 'v1/streets/' + id, {
    method: 'DELETE',
    headers: { 'Authorization': getAuthHeader() }
  }, false)
}
