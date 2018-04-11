import { START_PRINTING, STOP_PRINTING, SET_APP_FLAGS, EVERYTHING_LOADED, SET_CONTENT_DIRECTION } from './'

export function setAppFlags (flags) {
  return {
    type: SET_APP_FLAGS,
    flags
  }
}

export function startPrinting () {
  return {
    type: START_PRINTING
  }
}

export function stopPrinting () {
  return {
    type: STOP_PRINTING
  }
}

export function everythingLoaded () {
  return {
    type: EVERYTHING_LOADED
  }
}

export function setContentDirection (dir) {
  return {
    type: SET_CONTENT_DIRECTION,
    dir
  }
}
