import { SET_PRINTING } from './'

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
