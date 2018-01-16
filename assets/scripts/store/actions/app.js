import { SET_PRINTING, SET_APP_FLAGS, EVERYTHING_LOADED } from './'

export function setAppFlags (flags) {
  return {
    type: SET_APP_FLAGS,
    flags
  }
}

export function startPrinting () {
  return {
    type: SET_PRINTING,
    printing: true
  }
}

export function stopPrinting () {
  return {
    type: SET_PRINTING,
    printing: false
  }
}

export function everythingLoaded () {
  return {
    type: EVERYTHING_LOADED
  }
}
