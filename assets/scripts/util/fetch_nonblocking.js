import $ from 'jquery'

import { getAbortEverything } from '../app/initialization'
import {
  getSaveStreetIncomplete,
  setSaveStreetIncomplete
} from '../streets/xhr'

const NON_BLOCKING_AJAX_REQUEST_TIME = [10, 500, 1000, 5000, 10000]
const NON_BLOCKING_AJAX_REQUEST_BACKOFF_RANGE = 60000

const NO_CONNECTION_MESSAGE_TIMEOUT = 10000

let nonblockingAjaxRequests = []
let nonblockingAjaxRequestTimer = 0

const noConnectionMessage = {
  visible: false,
  timerId: -1,

  schedule: function () {
    if (noConnectionMessage.timerId === -1) {
      // TODO const
      noConnectionMessage.timerId =
        window.setTimeout(noConnectionMessage.show, NO_CONNECTION_MESSAGE_TIMEOUT)
    }
  },

  show: function () {
    document.querySelector('#no-connection-message').classList.add('visible')
    document.body.classList.add('no-connection-message-visible')
  },

  hide: function () {
    window.clearTimeout(noConnectionMessage.timerId)
    noConnectionMessage.timerId = -1

    document.querySelector('#no-connection-message').classList.remove('visible')
    document.body.classList.remove('no-connection-message-visible')
  }
}

export function attachFetchNonBlockingEventListeners () {
  window.addEventListener('stmx:everything_loaded', function () {
    document.querySelector('#no-connection-try-again').addEventListener('pointerdown', nonblockingAjaxTryAgain)
    window.addEventListener('beforeunload', onWindowBeforeUnload)
  })
}

export function newNonblockingAjaxRequest (request, allowToClosePage, doneFunc, errorFunc, maxRetries) {
  nonblockingAjaxRequestTimer = 0

  var signature = getAjaxRequestSignature(request)

  removeNonblockingAjaxRequest(signature)
  nonblockingAjaxRequests.push({
    request: request,
    allowToClosePage: allowToClosePage,
    doneFunc: doneFunc,
    errorFunc: errorFunc,
    inProgress: false,
    signature: signature,
    tryCount: 0,
    maxRetries: maxRetries
  })

  scheduleNextNonblockingAjaxRequest()
}

export function getNonblockingAjaxRequestCount () {
  return nonblockingAjaxRequests.length
}

function getAjaxRequestSignature (request) {
  return request.type + ' ' + request.url
}

function nonblockingAjaxTryAgain () {
  noConnectionMessage.hide()

  nonblockingAjaxRequestTimer = 0

  scheduleNextNonblockingAjaxRequest()
}

function sendNextNonblockingAjaxRequest () {
  if (getAbortEverything()) {
    return
  }

  if (getNonblockingAjaxRequestCount()) {
    noConnectionMessage.schedule()

    var request = null

    request = nonblockingAjaxRequests[0]

    if (request) {
      if (!request.inProgress) {
        request.inProgress = true

        $.ajax(request.request).done(function (data) {
          successNonblockingAjaxRequest(data, request)
        }).fail(function (data) {
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
    noConnectionMessage.hide()
    removeNonblockingAjaxRequest(request.signature)
    if (request.errorFunc) {
      request.errorFunc(data)
    }
  }
}

function successNonblockingAjaxRequest (data, request) {
  nonblockingAjaxRequestTimer = 0

  noConnectionMessage.hide()

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

  if (getAbortEverything()) {
    return
  }

  var showWarning = false

  if (getSaveStreetIncomplete()) {
    showWarning = true
  } else {
    for (var i in nonblockingAjaxRequests) {
      if (!nonblockingAjaxRequests[i].allowToClosePage) {
        showWarning = true
      }
    }
  }

  if (showWarning) {
    nonblockingAjaxRequestTimer = 0
    scheduleNextNonblockingAjaxRequest()

    return 'Your changes have not been saved yet. Please return to the page, check your Internet connection, and wait a little while to allow the changes to be saved.'
  }
}

function onWindowBeforeUnload () {
  var text = checkIfChangesSaved()
  if (text) {
    return text
  }
}
