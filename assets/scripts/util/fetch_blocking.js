/**
 * Create blocking fetch requests.
 * Display a blocking shield when a request is in progress.
 * Only one of these should be active at any time and
 * no other fetch / xhr / ajax should exist when they do.
 */
import { showBlockingShield, hideBlockingShield, darkenBlockingShield } from '../app/blocking_shield'

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

export function newBlockingAjaxRequest (message, request, doneFunc, cancelFunc) {
  showBlockingShield(message)

  blockingAjaxRequestInProgress = true

  blockingAjaxRequest = request
  blockingAjaxRequestDoneFunc = doneFunc
  blockingAjaxRequestCancelFunc = cancelFunc

  window.fetch(blockingAjaxRequest.url, blockingAjaxRequest)
    .then(response => {
      if (!response.ok) {
        throw response
      }

      return response.json()
    })
    .then(successBlockingAjaxRequest)
    .catch(errorBlockingAjaxRequest)
}

function successBlockingAjaxRequest (data) {
  hideBlockingShield()
  blockingAjaxRequestInProgress = false
  blockingAjaxRequestDoneFunc(data)
}

function errorBlockingAjaxRequest () {
  if (blockingAjaxRequestCancelFunc) {
    document.querySelector('#blocking-shield').classList.add('show-cancel')
  }

  document.querySelector('#blocking-shield').classList.add('show-try-again')

  darkenBlockingShield()
}

// These export to the blocking shield to retry or cancel requests

export function blockingTryAgain () {
  document.querySelector('#blocking-shield').classList.remove('show-try-again')
  document.querySelector('#blocking-shield').classList.remove('show-cancel')

  window.fetch(blockingAjaxRequest.url, blockingAjaxRequest)
    .then(response => {
      if (!response.ok) {
        throw response
      }

      return response.json()
    })
    .then(successBlockingAjaxRequest)
    .catch(errorBlockingAjaxRequest)
}

export function blockingCancel () {
  hideBlockingShield()
  blockingAjaxRequestInProgress = false
  blockingAjaxRequestCancelFunc()
}
