import clone from 'just-clone'
import { showError, ERRORS } from '../app/errors'
import {
  checkIfEverythingIsLoaded,
  setServerContacted,
} from '../app/initialization'
import { formatMessage } from '../locales/locale'
import { MODES, processMode, getMode, setMode } from '../app/mode'
import { STREET_TEMPLATES } from '../app/constants'
import { goNewStreet } from '../app/routing'
import { app } from '../preinit/app_settings'
import { segmentsChanged } from '../segments/view'
import { getSignInData, isSignedIn } from '../users/authentication'
import {
  deleteStreet,
  getStreet,
  getStreetWithParams,
  postStreet,
  putStreet,
} from '../util/api'
import {
  isblockingAjaxRequestInProgress,
  newBlockingAjaxRequest,
} from '../util/fetch_blocking'
import store from '../store'
import { updateSettings } from '../store/slices/settings'
import {
  saveStreetId,
  saveOriginalStreetId,
  updateEditCount,
  updateStreetData,
} from '../store/slices/street'
import { addToast } from '../store/slices/toasts'
import { resetUndoStack } from '../store/slices/history'
import { makeDefaultStreet } from './creation'
import {
  trimStreetData,
  updateEverything,
  addAltVariantObject,
  setStreetCreatorId,
  setUpdateTimeToNow,
  setLastStreet,
  setIgnoreStreetChanges,
} from './data_model'
import { prepareStreet } from './templates'
import {
  getRemixOnFirstEdit,
  setRemixOnFirstEdit,
  remixStreet,
  addRemixSuffixToName,
} from './remix'
import { unifyUndoStack } from './undo_stack'
import { deleteStreetThumbnail } from './image'

const SAVE_STREET_DELAY = 500

let saveStreetTimerId = -1
let saveStreetIncomplete = false

export function getSaveStreetIncomplete() {
  return saveStreetIncomplete
}

export function setSaveStreetIncomplete(value) {
  saveStreetIncomplete = value
}

let latestRequestId

export async function createNewStreetOnServer(type = STREET_TEMPLATES.DEFAULT) {
  try {
    await prepareStreet(type)
  } catch (err) {
    console.log(err)
    errorReceiveNewStreet()
    return
  }

  const transmission = packServerStreetDataRaw()

  postStreet(transmission).then(receiveNewStreet).catch(errorReceiveNewStreet)
}

function receiveNewStreet({ data }) {
  setStreetId(data.id, data.namespacedId)
  saveStreetToServer(true)
}

function errorReceiveNewStreet({ response }) {
  if (response.status === 401) {
    showError(ERRORS.AUTH_EXPIRED, true)
  } else {
    showError(ERRORS.NEW_STREET_SERVER_FAILURE, true)
  }
}

export async function fetchStreetFromServer() {
  const street = store.getState().street

  try {
    const response = await getStreetWithParams(
      street.creatorId,
      street.namespacedId
    )
    receiveStreet(response.data)
  } catch (error) {
    errorReceiveStreet(error)
  }
}

function errorReceiveStreet(error) {
  const data = error.response.data
  const mode = getMode()
  if (
    mode === MODES.CONTINUE ||
    mode === MODES.USER_GALLERY ||
    mode === MODES.GLOBAL_GALLERY
  ) {
    goNewStreet()
  } else {
    if (data.status === 404 || data.status === 410) {
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

export function saveStreetToServer(initial) {
  if (app.readOnly) {
    return
  }

  const transmission = packServerStreetDataRaw()
  const street = store.getState().street

  putStreet(street.id, transmission).then(() => {
    setSaveStreetIncomplete(false)

    if (initial) {
      confirmSaveStreetToServerInitial()
    }
  })
}

function confirmSaveStreetToServerInitial() {
  setServerContacted(true)
  checkIfEverythingIsLoaded()
}

function clearScheduledSavingStreetToServer() {
  window.clearTimeout(saveStreetTimerId)
}

export async function fetchStreetForVerification() {
  // Don’t do it with any network services pending
  // NOTE: this used to check for all nonblocking requests,
  // but this system is getting refactored away -- so we're
  // not really checking against all pending requests anymore.
  if (
    isblockingAjaxRequestInProgress() ||
    saveStreetIncomplete ||
    store.getState().errors.abortEverything ||
    getRemixOnFirstEdit()
  ) {
    return
  }

  latestRequestId = Date.now()
  const streetId = store.getState().street.id

  try {
    const response = await getStreet(streetId, {
      headers: { 'x-streetmix-request-id': latestRequestId },
    })

    // Response headers are lower-case via Axios
    const requestId = response.headers['x-streetmix-request-id']
    // Throw an error if response is stale
    if (latestRequestId !== Number.parseInt(requestId, 10)) {
      throw new Error('1')
    }

    // Handle response data
    receiveStreetForVerification(response.data)
  } catch (error) {
    // Silently throw away stale responses
    if (error.message === '1') return

    // Otherwise, handle the error
    console.log(error)
    errorReceiveStreetForVerification(error.response)
  }
}

/**
 * Compare the `clientUpdatedAt` value of local data to server data.
 * We don't use `updatedAt` which is only updated on the server. We use
 * `clientUpdatedAt` which is only used to validate the age of local data.
 * If local data is outdated, then we replace it with the updated data.
 *
 * @param {Object} transmission - server data
 */
function receiveStreetForVerification(transmission) {
  const localUpdatedAt = new Date(store.getState().street.clientUpdatedAt)
  const serverUpdatedAt = new Date(transmission.clientUpdatedAt)

  if (serverUpdatedAt && localUpdatedAt && serverUpdatedAt > localUpdatedAt) {
    store.dispatch(
      addToast({
        method: 'warning',
        message: formatMessage(
          'toast.reloaded',
          'Your street was reloaded from the server as it was modified elsewhere.'
        ),
      })
    )

    unpackServerStreetData(transmission, null, null, false)

    // Update everything, but don't re-save the street to the server,
    // which will re-invalidate the local copy.
    updateEverything(false)
  }
}

function errorReceiveStreetForVerification(data) {
  // 404 should never happen here, since 410 designates streets that have
  // been deleted (but remain hidden on the server)

  if (isSignedIn() && (data.status === 404 || data.status === 410)) {
    showError(ERRORS.STREET_DELETED_ELSEWHERE, true)
  }
}

function receiveStreet(transmission) {
  unpackServerStreetData(transmission, null, null, true)

  setServerContacted(true)

  // Legacy - remove once everything is Promise-based.
  checkIfEverythingIsLoaded()
}

function unpackStreetDataFromServerTransmission(transmission) {
  // Catch a data error where a user's street might be retrieved
  // without any data in it (so-called error 9B)
  if (!transmission.data) {
    showError(ERRORS.STREET_DATA_FAILURE)
    return
  }

  const street = clone(transmission.data.street)
  street.creatorId = transmission.creatorId ?? null
  street.originalStreetId = transmission.originalStreetId ?? null
  street.updatedAt = transmission.updatedAt ?? null
  street.clientUpdatedAt = transmission.clientUpdatedAt ?? null
  street.name = transmission.name ?? null
  street.location = transmission.data.street.location ?? null
  street.editCount = transmission.data.street.editCount ?? 0

  // Delete deprecated properties, if present
  delete street.leftBuildingVariant
  delete street.leftBuildingHeight
  delete street.rightBuildingVariant
  delete street.rightBuildingHeight

  return street
}

export function unpackServerStreetData(
  transmission,
  id,
  namespacedId,
  checkIfNeedsToBeRemixed
) {
  const street = unpackStreetDataFromServerTransmission(transmission)
  addAltVariantObject(street)

  store.dispatch(updateStreetData(street))
  store.dispatch(resetUndoStack())

  if (id) {
    setStreetId(id, namespacedId)
  } else {
    setStreetId(transmission.id, transmission.namespacedId)
  }

  if (checkIfNeedsToBeRemixed) {
    if (!isSignedIn() || street.creatorId !== getSignInData().userId) {
      setRemixOnFirstEdit(true)
    } else {
      setRemixOnFirstEdit(false)
    }

    if (!getRemixOnFirstEdit()) {
      saveStreetToServer()
    }
  }
}

export function packServerStreetDataRaw() {
  const data = {}
  data.street = trimStreetData(store.getState().street)

  // Those go above data in the structure, so they need to be cleared here
  delete data.street.name
  delete data.street.originalStreetId
  delete data.street.updatedAt
  delete data.street.clientUpdatedAt

  // This will be implied through authorization header
  delete data.street.creatorId

  if (store.getState().flags.SAVE_UNDO.value === true) {
    data.undoStack = clone(store.getState().undo.stack)
    data.undoPosition = store.getState().undo.position
  }

  const street = store.getState().street
  const transmission = {
    name: street.name,
    originalStreetId: street.originalStreetId,
    data,
    clientUpdatedAt: street.clientUpdatedAt,
  }

  return transmission
}

// Legacy: converts raw JS objects to JSON.
// axios-based requests do this automatically.
export function packServerStreetData() {
  const transmission = packServerStreetDataRaw()
  return JSON.stringify(transmission)
}

export function setStreetId(newId, newNamespacedId) {
  store.dispatch(saveStreetId(newId, newNamespacedId))

  unifyUndoStack()
  updateLastStreetInfo()
}

export function updateLastStreetInfo() {
  const street = store.getState().street
  store.dispatch(
    updateSettings({
      lastStreetId: street.id,
      lastStreetNamespacedId: street.namespacedId,
      lastStreetCreatorId: street.creatorId,
    })
  )
}

export function scheduleSavingStreetToServer() {
  saveStreetIncomplete = true

  clearScheduledSavingStreetToServer()

  if (getRemixOnFirstEdit()) {
    remixStreet()
  } else {
    saveStreetTimerId = window.setTimeout(function () {
      saveStreetToServer(false)
    }, SAVE_STREET_DELAY)
  }
}

// Look into replacing with getLastStreet() from store/actions
// -- it was formerly used by "here's your new street" in <WelcomePanel />
export function fetchLastStreet() {
  const streetId = store.getState().app.priorLastStreetId

  newBlockingAjaxRequest(
    'load',
    {
      // TODO const
      url: '/api/v1/streets/' + streetId,
      method: 'GET',
    },
    receiveLastStreet,
    cancelReceiveLastStreet
  )
}

async function cancelReceiveLastStreet() {
  await makeDefaultStreet()
}

function receiveLastStreet(transmission) {
  setIgnoreStreetChanges(true)
  const street = store.getState().street
  unpackServerStreetData(transmission, street.id, street.namespacedId, false)
  const priorLastStreetId = store.getState().app.priorLastStreetId
  store.dispatch(saveOriginalStreetId(priorLastStreetId))
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

export function sendDeleteStreetToServer(id) {
  deleteStreet(id)

  // Delete street thumbnail from Cloudinary.
  // TODO: handle this from the backend!
  deleteStreetThumbnail(id)

  // Prevents new street submenu from showing the last street
  const settings = store.getState().settings

  if (settings.lastStreetId === id) {
    store.dispatch(
      updateSettings({
        lastStreetId: null,
        lastStreetCreatorId: null,
        lastStreetNamespacedId: null,
      })
    )
  }
}
