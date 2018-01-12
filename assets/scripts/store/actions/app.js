import { SET_PRINTING, SET_APP_FLAGS } from './'

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
