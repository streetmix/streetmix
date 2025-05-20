import {
  getBoundaryImageHeight,
  getBoundaryItem,
  drawBoundary
} from '~/src/boundary'
import store from '../store'

const MAX_CANVAS_HEIGHT = 2048

export const GROUND_BASELINE_HEIGHT = 44

/**
 * Creates building canvas element to draw on
 *
 * @param {HTMLElement} el - wrapping element for canvas
 * @param {string} variant
 * @param {string} position
 * @param {Number} floors
 * @param {Boolean} shadeIn - colors the building with a red overlay
 */
export function createBuilding (el, variant, position, floors, shadeIn) {
  const elementWidth = el.offsetWidth

  // Determine building dimensions
  const building = getBoundaryItem(variant)
  const overhangWidth =
    typeof building.overhangWidth === 'number' ? building.overhangWidth : 0
  const buildingHeight = getBoundaryImageHeight(variant, position, floors)

  // Determine canvas dimensions from building dimensions
  const width = elementWidth + overhangWidth
  const height = Math.min(MAX_CANVAS_HEIGHT, buildingHeight)

  // Create canvas
  const canvasEl = document.createElement('canvas')
  const oldCanvasEl = el.querySelector('canvas')
  const dpi = store.getState().system.devicePixelRatio

  canvasEl.width = width * dpi
  canvasEl.height = (height + GROUND_BASELINE_HEIGHT) * dpi
  canvasEl.style.width = width + 'px'
  canvasEl.style.height = height + GROUND_BASELINE_HEIGHT + 'px'

  // Replace previous canvas if present, otherwise append a new one
  if (oldCanvasEl) {
    el.replaceChild(canvasEl, oldCanvasEl)
  } else {
    el.appendChild(canvasEl)
  }

  const ctx = canvasEl.getContext('2d')

  drawBoundary(
    ctx,
    variant,
    floors,
    position,
    width,
    height,
    0,
    1.0,
    dpi,
    shadeIn
  )
}
