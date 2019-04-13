import {
  getSaveStreetIncomplete,
  setSaveStreetIncomplete
} from '../streets/xhr'
import { isThumbnailSaved, SAVE_THUMBNAIL_EVENTS, saveStreetThumbnail } from '../streets/image'
import store from '../store'
import { showNoConnectionMessage } from '../store/actions/status'

const NON_BLOCKING_AJAX_REQUEST_TIME = [10, 500, 1000, 5000, 10000]
const NON_BLOCKING_AJAX_REQUEST_BACKOFF_RANGE = 60000

let nonblockingAjaxRequests = []
let nonblockingAjaxRequestTimer = 0

function scheduleNoConnectionMessage () {
  store.dispatch(showNoConnectionMessage(true))
}

function hideNoConnectionMessage () {
  store.dispatch(showNoConnectionMessage(false))
}

export function newNonblockingAjaxRequest (url, options, allowToClosePage, doneFunc, errorFunc, maxRetries) {
  nonblockingAjaxRequestTimer = 0

  var signature = getAjaxRequestSignature(url, options)

  removeNonblockingAjaxRequest(signature)
  nonblockingAjaxRequests.push({
    url,
    options,
    allowToClosePage,
    doneFunc,
    errorFunc,
    inProgress: false,
    signature,
    tryCount: 0,
    maxRetries
  })

  scheduleNextNonblockingAjaxRequest()
}

export function getNonblockingAjaxRequestCount () {
  return nonblockingAjaxRequests.length
}

function getAjaxRequestSignature (url, request) {
  return request.method + ' ' + url
}

export function nonblockingAjaxTryAgain () {
  hideNoConnectionMessage()

  nonblockingAjaxRequestTimer = 0

  scheduleNextNonblockingAjaxRequest()
}

function sendNextNonblockingAjaxRequest () {
  if (store.getState().errors.abortEverything) {
    return
  }

  if (getNonblockingAjaxRequestCount()) {
    scheduleNoConnectionMessage()

    var request = null

    request = nonblockingAjaxRequests[0]

    if (request) {
      if (!request.inProgress) {
        request.inProgress = true

        window.fetch(request.url, request.options)
          .then(response => {
            if (!response.ok) {
              throw response
            }
            return response
          })
          .then(data => {
            successNonblockingAjaxRequest(data, request)
          })
          .catch(data => {
            errorNonblockingAjaxRequest(data, request)
          })
      }
    }

    scheduleNextNonblockingAjaxRequest()
  }
}

// also needed by window_unload
function scheduleNextNonblockingAjaxRequest () {
  if (getNonblockingAjaxRequestCount()) {
    let time
    if (nonblockingAjaxRequestTimer < NON_BLOCKING_AJAX_REQUEST_TIME.length) {
      time = NON_BLOCKING_AJAX_REQUEST_TIME[nonblockingAjaxRequestTimer]
    } else {
      time = Math.floor(Math.random() * NON_BLOCKING_AJAX_REQUEST_BACKOFF_RANGE)
    }

    window.setTimeout(sendNextNonblockingAjaxRequest, time)

    nonblockingAjaxRequestTimer++
  } else {
    setSaveStreetIncomplete(false)
  }
}

function removeNonblockingAjaxRequest (signature) {
  for (var i in nonblockingAjaxRequests) {
    if (nonblockingAjaxRequests[i].signature === signature) {
      nonblockingAjaxRequests.splice(i, 1)
      break
    }
  }
}

function errorNonblockingAjaxRequest (data, request) {
  // Do not execute the error function immediately if there is
  // a directive to retry a certain number of times first.
  if (request.errorFunc && !request.maxRetries) {
    request.errorFunc(data)
  }

  request.tryCount++
  request.inProgress = false

  // Abort resending if the max number of tries has been hit.
  if (request.maxRetries && request.tryCount >= request.maxRetries) {
    nonblockingAjaxRequestTimer = 0
    hideNoConnectionMessage()
    removeNonblockingAjaxRequest(request.signature)
    if (request.errorFunc) {
      request.errorFunc(data)
    }
  }
}

function successNonblockingAjaxRequest (data, request) {
  nonblockingAjaxRequestTimer = 0

  hideNoConnectionMessage()

  removeNonblockingAjaxRequest(request.signature)

  if (request.doneFunc) {
    request.doneFunc(data)
  }

  scheduleNextNonblockingAjaxRequest()
}

// Non-blocking AJAX requests are checked to see if any are
// in progress before a window is unloaded

function checkIfChangesSaved () {
  // don’t do for settings deliberately

  if (store.getState().errors.abortEverything) {
    return
  }

  let showWarning = false

  if (getSaveStreetIncomplete()) {
    showWarning = true
  } else {
    for (let i in nonblockingAjaxRequests) {
      if (!nonblockingAjaxRequests[i].allowToClosePage) {
        showWarning = true
      }
    }
  }

  // If thumbnail needs to be saved before window close, show warning.
  if (!isThumbnailSaved()) {
    showWarning = true
  }

  if (showWarning) {
    nonblockingAjaxRequestTimer = 0
    scheduleNextNonblockingAjaxRequest()
    saveStreetThumbnail(store.getState().street, SAVE_THUMBNAIL_EVENTS.BEFOREUNLOAD)
    return 'Your changes have not been saved yet. Please return to the page, check your Internet connection, and wait a little while to allow the changes to be saved.'
  }
}

export function onWindowBeforeUnload (event) {
  const text = checkIfChangesSaved()

  // NOTE: custom text is no longer returned as a message in many browsers,
  // e.g. Chrome 51. see:
  // https://developers.google.com/web/updates/2016/04/chrome-51-deprecations?hl=en#remove_custom_messages_in_onbeforeunload_dialogs
  if (text) {
    event.returnValue = text
    return text
  }
}
