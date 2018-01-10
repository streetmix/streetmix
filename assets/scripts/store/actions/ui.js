import { SHOW_STREET_NAME_CANVAS, HIDE_STREET_NAME_CANVAS } from './index'

export function showStreetNameCanvas () {
  return {
    type: SHOW_STREET_NAME_CANVAS
  }
}

export function hideStreetNameCanvas () {
  return {
    type: HIDE_STREET_NAME_CANVAS
  }
}
