/**
 * Create blocking fetch requests.
 * Display a blocking shield when a request is in progress.
 * Only one of these should be active at any time and
 * no other fetch / xhr / ajax should exist when they do.
 */
import {
  showBlockingShield,
  hideBlockingShield,
  darkenBlockingShield,
} from '../app/blocking_shield'

interface BlockingAjaxRequest extends RequestInit {
  url: string
}

let blockingAjaxRequest: BlockingAjaxRequest | null = null
let blockingAjaxRequestDoneFunc: ((data: unknown) => void) | null = null
let blockingAjaxRequestCancelFunc: (() => void) | null = null

let blockingAjaxRequestInProgress = false

// blockingAjaxRequestInProgress needs to be exported for streets/xhr
// Exporting a variable to window causes it to lose its immutable
// binding to the package, so we use a getter function to achieve
// the same
// TODO: Store application state differently
export function isblockingAjaxRequestInProgress(): boolean {
  return blockingAjaxRequestInProgress
}

export function newBlockingAjaxRequest(
  mode: string,
  request: BlockingAjaxRequest,
  doneFunc: (data: unknown) => void,
  cancelFunc: () => Promise<void> | void
): void {
  showBlockingShield(mode)

  blockingAjaxRequestInProgress = true

  blockingAjaxRequest = request
  blockingAjaxRequestDoneFunc = doneFunc
  blockingAjaxRequestCancelFunc = cancelFunc

  makeBlockingAjaxRequest()
}

function successBlockingAjaxRequest(data: unknown): void {
  hideBlockingShield()
  if (blockingAjaxRequestDoneFunc !== null) {
    blockingAjaxRequestDoneFunc(data)
  }
  blockingRequestCleanup()
}

function errorBlockingAjaxRequest(): void {
  if (blockingAjaxRequestCancelFunc !== null) {
    darkenBlockingShield(true)
  }
}

function makeBlockingAjaxRequest(): void {
  if (blockingAjaxRequest === null) return

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

export function blockingTryAgain(): void {
  makeBlockingAjaxRequest()
}

export function blockingCancel(): void {
  if (blockingAjaxRequestCancelFunc) {
    blockingAjaxRequestCancelFunc()
  }
  blockingRequestCleanup()
}

function blockingRequestCleanup(): void {
  blockingAjaxRequest = null
  blockingAjaxRequestDoneFunc = null
  blockingAjaxRequestCancelFunc = null
  blockingAjaxRequestInProgress = false
}
