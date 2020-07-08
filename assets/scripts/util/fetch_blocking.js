/**
 * Create blocking fetch requests.
 * Display a blocking shield when a request is in progress.
 * Only one of these should be active at any time and
 * no other fetch / xhr / ajax should exist when they do.
 */
import {
  showBlockingShield,
  hideBlockingShield,
  darkenBlockingShield
} from '../app/blocking_shield'

let blockingAjaxRequest
let blockingAjaxRequestDoneFunc
let blockingAjaxRequestCancelFunc

let blockingAjaxRequestInProgress = false

// blockingAjaxRequestInProgress needs to be exported for streets/xhr
// Exporting a variable to window causes it to lose its immutable
// binding to the package, so we use a getter function to achieve
// the same
// TODO: Store application state differently
export function isblockingAjaxRequestInProgress () {
  return blockingAjaxRequestInProgress
}

export function newBlockingAjaxRequest (mode, request, doneFunc, cancelFunc) {
  showBlockingShield(mode)

  blockingAjaxRequestInProgress = true

  blockingAjaxRequest = request
  blockingAjaxRequestDoneFunc = doneFunc
  blockingAjaxRequestCancelFunc = cancelFunc

  makeBlockingAjaxRequest()
}

function successBlockingAjaxRequest (data) {
  hideBlockingShield()
  blockingAjaxRequestInProgress = false
  blockingAjaxRequestDoneFunc(data)
}

function errorBlockingAjaxRequest () {
  darkenBlockingShield(blockingAjaxRequestCancelFunc)
}

function makeBlockingAjaxRequest () {
  window
    .fetch(blockingAjaxRequest.url, blockingAjaxRequest)
    .then((response) => {
      if (!response.ok) {
        throw response
      }

      return response.json()
    })
    .then(successBlockingAjaxRequest)
    .catch(errorBlockingAjaxRequest)
}

// These export to the blocking shield to retry or cancel requests

export function blockingTryAgain () {
  makeBlockingAjaxRequest()
}

export function blockingCancel () {
  blockingAjaxRequestInProgress = false
  blockingAjaxRequestCancelFunc()
}
