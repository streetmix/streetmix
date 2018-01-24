import { UPDATE_WINDOW_SIZE } from './'

export function windowResize (viewportWidth, viewportHeight) {
  return {
    type: UPDATE_WINDOW_SIZE,
    viewportWidth: viewportWidth,
    viewportHeight: viewportHeight
  }
}
