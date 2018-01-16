import { SET_PRINTING, EVERYTHING_LOADED } from './'

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
