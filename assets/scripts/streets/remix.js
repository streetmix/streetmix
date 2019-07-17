import { API_URL } from '../app/config'
import { showStatusMessage } from '../app/status_message'
import { t } from '../locales/locale'
import { app } from '../preinit/app_settings'
import {
  getAuthHeader,
  getSignInData,
  isSignedIn
} from '../users/authentication'
import { newBlockingAjaxRequest } from '../util/fetch_blocking'
import { setStreetCreatorId } from './data_model'
import { getUndoStack, getUndoPosition, unifyUndoStack } from './undo_stack'
import { saveStreetToServer, packServerStreetData, setStreetId } from './xhr'
import store from '../store'
import {
  saveStreetName,
  updateEditCount,
  saveOriginalStreetId
} from '../store/actions/street'

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

  if (isSignedIn()) {
    setStreetCreatorId(getSignInData().userId)
  } else {
    setStreetCreatorId(null)
  }

  const street = store.getState().street
  store.dispatch(saveOriginalStreetId(street.id))
  store.dispatch(updateEditCount(0))

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

  newBlockingAjaxRequest('remix',
    {
      // TODO const
      url: API_URL + 'v1/streets',
      method: 'POST',
      body: transmission,
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      }
    }, receiveRemixedStreet
  )
}

function receiveRemixedStreet (data) {
  if (!promoteStreet) {
    if (isSignedIn()) {
      showStatusMessage(t('toast.remixing', 'Now editing a freshly-made duplicate of the original street. The duplicate has been put in your gallery.'))
    } else {
      showStatusMessage(t('toast.remixing-sign-in', 'Now editing a freshly-made duplicate of the original street. Sign in to start your own gallery of streets.'), false, true)
    }
  }

  setStreetId(data.id, data.namespacedId)

  saveStreetToServer(false)
}

export function addRemixSuffixToName () {
  const street = store.getState().street

  // Bail if street is unnamed
  if (!street.name) return

  if (street.name.substr(street.name.length - STREET_NAME_REMIX_SUFFIX.length,
    STREET_NAME_REMIX_SUFFIX.length) !== STREET_NAME_REMIX_SUFFIX) {
    street.name += ' ' + STREET_NAME_REMIX_SUFFIX
  }
  store.dispatch(saveStreetName(street.name, false))
}
