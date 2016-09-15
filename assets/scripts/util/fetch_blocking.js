/**
 * Create blocking fetch requests.
 * Display a blocking shield when a request is in progress.
 * Only one of these should be active at any time and
 * no other fetch / xhr / ajax should exist when they do.
 */
import $ from 'jquery'
import BlockingShield from '../app/blocking_shield'

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

// TODO: Migrate newBlockingAjaxRequest to Fetch-based API
// Before, you had to pass in the success and error functions.
// Instead return a promise and let the requesting script respond
// with what it needs to do

// Something like this:
// function newBlockingFetchRequest (message, url, options) {
//   showBlockingShield(message)

//   return window.fetch(url, options)
//     .then((response) => {
//       if (response.ok) {
//         return response.json()
//       } else {
//         throw new Error(`Unable to fetch ${url} because ${response.status}`)
//       }
//     })
//     .then((data) => {
//       // Success, pass data and control to next .then()
//       hideBlockingShield()
//       blockingAjaxRequestInProgress = false

//       return data
//     })
//     .catch((error) => {
//       console.error(error)
//       if (blockingAjaxRequestCancelFunc) {
//         document.querySelector('#blocking-shield').classList.add('show-cancel')
//       }

//       document.querySelector('#blocking-shield').classList.add('show-try-again')

//       darkenBlockingShield()
//     })
// }

export function newBlockingAjaxRequest (message, request, doneFunc, cancelFunc) {
  BlockingShield.show(message)

  blockingAjaxRequestInProgress = true

  blockingAjaxRequest = request
  blockingAjaxRequestDoneFunc = doneFunc
  blockingAjaxRequestCancelFunc = cancelFunc

  $.ajax(blockingAjaxRequest)
    .done(successBlockingAjaxRequest).fail(errorBlockingAjaxRequest)
}

function successBlockingAjaxRequest (data) {
  BlockingShield.hide()
  blockingAjaxRequestInProgress = false
  blockingAjaxRequestDoneFunc(data)
}

function errorBlockingAjaxRequest () {
  if (blockingAjaxRequestCancelFunc) {
    document.querySelector('#blocking-shield').classList.add('show-cancel')
  }

  document.querySelector('#blocking-shield').classList.add('show-try-again')

  BlockingShield.darken()
}

// These export to the blocking shield to retry or cancel requests

export function blockingTryAgain () {
  document.querySelector('#blocking-shield').classList.remove('show-try-again')
  document.querySelector('#blocking-shield').classList.remove('show-cancel')

  $.ajax(blockingAjaxRequest)
    .done(successBlockingAjaxRequest).fail(errorBlockingAjaxRequest)
}

export function blockingCancel () {
  BlockingShield.hide()
  blockingAjaxRequestInProgress = false
  blockingAjaxRequestCancelFunc()
}
