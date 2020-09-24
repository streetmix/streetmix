import { API_URL } from '../app/config'
import { formatMessage } from '../locales/locale'
import { app } from '../preinit/app_settings'
import { getSignInData, isSignedIn } from '../users/authentication'
import { newBlockingAjaxRequest } from '../util/fetch_blocking'
import { setStreetCreatorId } from './data_model'
import { getUndoStack, getUndoPosition, unifyUndoStack } from './undo_stack'
import { saveStreetToServer, packServerStreetData, setStreetId } from './xhr'
import store from '../store'
import {
  saveStreetName,
  updateEditCount,
  saveOriginalStreetId
} from '../store/slices/street'
import { addToast } from '../store/slices/toasts'

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
  if (
    undoStack[undoPosition - 1] &&
    undoStack[undoPosition - 1].name !== street.name
  ) {
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

  newBlockingAjaxRequest(
    'remix',
    {
      // TODO const
      url: API_URL + 'v1/streets',
      method: 'POST',
      body: transmission,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    receiveRemixedStreet
  )
}

function receiveRemixedStreet (data) {
  if (!promoteStreet) {
    if (isSignedIn()) {
      store.dispatch(
        addToast({
          message: formatMessage(
            'toast.remixing',
            'Now editing a freshly-made duplicate of the original street. The duplicate has been put in your gallery.'
          )
        })
      )
    } else {
      store.dispatch(
        addToast({
          message: formatMessage(
            'toast.remixing-sign-in',
            'Now editing a freshly-made duplicate of the original street. Sign in to start your own gallery of streets.'
          ),
          component: 'TOAST_SIGN_IN',
          duration: 12000
        })
      )
    }
  }

  setStreetId(data.id, data.namespacedId)

  saveStreetToServer(false)
}

export function addRemixSuffixToName () {
  const street = store.getState().street

  // Bail if street is unnamed
  if (!street.name) return

  if (
    street.name.substr(
      street.name.length - STREET_NAME_REMIX_SUFFIX.length,
      STREET_NAME_REMIX_SUFFIX.length
    ) !== STREET_NAME_REMIX_SUFFIX
  ) {
    const newStreetName = street.name + ' ' + STREET_NAME_REMIX_SUFFIX
    store.dispatch(saveStreetName(newStreetName, false))
  }
}
