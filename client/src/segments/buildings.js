import seedrandom from 'seedrandom'
import { round } from '@streetmix/utils'

import {
  getBoundaryImageHeight,
  getBoundaryItem,
  getSpriteId
} from '~/src/boundary'
import { generateRandSeed } from '../util/random'
import { prettifyWidth } from '../util/width_units'
import { images } from '../app/load_resources'
import store from '../store'
import { SETTINGS_UNITS_METRIC } from '../users/constants'
import {
  TILE_SIZE,
  TILESET_POINT_PER_PIXEL,
  BUILDING_LEFT_POSITION
} from './constants'
import { drawSegmentImage } from './view'

const MAX_CANVAS_HEIGHT = 2048

export const GROUND_BASELINE_HEIGHT = 44

/**
 * Converts the number of floors to an actual height in meters
 *
 * @param {string} variant
 * @param {string} position - "left" or "right"
 * @param {Number} floors
 * @returns {Number} height, in meters
 */
export function calculateRealHeightNumber (variant, position, floors) {
  const CURB_HEIGHT = 0.15 // meters
  return (
    (getBoundaryImageHeight(variant, position, floors) - CURB_HEIGHT) /
    TILE_SIZE
  )
}

/**
 * Given a building, return a string showing number of floors and actual
 * height measurement e.g. when height value is `4` return a string that
 * looks like this:
 *    "4 floors (45m)"
 *
 * @todo Localize return value
 * @param {string} variant - what type of building is it
 * @param {string} position - what side is it on (left or right)
 * @param {Number} floors - number of floors
 * @param {Number} units - units, either SETTINGS_UNITS_METRIC or SETTINGS_UNITS_IMPERIAL
 * @param {Function} formatMessage - pass in intl.formatMessage()
 */
export function prettifyHeight (
  variant,
  position,
  floors,
  units,
  formatMessage
) {
  let text = formatMessage(
    {
      id: 'building.floors-count',
      defaultMessage: '{count, plural, one {# floor} other {# floors}}'
    },
    {
      count: floors
    }
  )

  let realHeight = calculateRealHeightNumber(variant, position, floors)
  if (units === SETTINGS_UNITS_METRIC) {
    realHeight = round(realHeight, 1)
  }
  const prettifiedHeight = prettifyWidth(realHeight, units)

  text += ` (${prettifiedHeight})`

  return text
}

/**
 * Draws the building on a canvas
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} variant - building
 * @param {Number} floors - number of floors, if building as floors
 * @param {string} position - left or right
 * @param {Number} totalWidth - canvas width area to draw on
 * @param {Number} totalHeight - canvas height area to draw on
 * @param {Number} offsetLeft - left-position shift
 * @param {Number} multiplier - scale of image
 * @param {Number} dpi - pixel density of screen
 * @param {Boolean} shadeIn - if true, add red colored overlay
 */
export function drawBuilding (
  ctx,
  variant,
  floors,
  position,
  totalWidth,
  totalHeight,
  offsetLeft,
  multiplier,
  dpi,
  shadeIn = false
) {
  const building = getBoundaryItem(variant)

  const spriteId = getSpriteId(variant, position)
  const svg = images.get(spriteId)

  const buildingHeight = getBoundaryImageHeight(variant, position, floors)
  let offsetTop = totalHeight - buildingHeight * multiplier

  // Adjust offset if the building should be aligned at baseline instead of ground plane
  if (building.alignAtBaseline) {
    offsetTop += GROUND_BASELINE_HEIGHT
  }

  // Some building sprites tile itself, while others tile just half of it
  let width, x, lastX, firstX
  if (building.repeatHalf) {
    width = svg.width / TILESET_POINT_PER_PIXEL / 2 // 2 = halfway point is where repeat starts.

    if (position === BUILDING_LEFT_POSITION) {
      x = 0 // repeat the left half of this sprite
      lastX = svg.width / 2 // anchor the right half of this sprite
    } else {
      x = svg.width / 2 // repeat the right half of this sprite
      firstX = 0 // anchor the left half of this sprite
    }
  } else {
    width = svg.width / TILESET_POINT_PER_PIXEL
  }

  // For buildings in the left position, align building to the right
  let leftPosShift = 0
  if (position === BUILDING_LEFT_POSITION) {
    if (!building.hasFloors) {
      // takes into consideration tiling
      leftPosShift = (totalWidth % width) - (width + width)
    } else {
      leftPosShift = totalWidth - width
    }
  }

  // Multifloor buildings
  if (building.hasFloors) {
    const height = svg.height // actual pixels, don't need to divide by TILESET_POINT_PER_PIXEL

    // bottom floor
    drawSegmentImage(
      spriteId,
      ctx,
      0,
      height - building.mainFloorHeight * TILE_SIZE * TILESET_POINT_PER_PIXEL, // 0 - 240 + (120 * building.variantsCount),
      undefined,
      building.mainFloorHeight * TILE_SIZE,
      offsetLeft + leftPosShift * multiplier,
      offsetTop +
        (buildingHeight - building.mainFloorHeight * TILE_SIZE) * multiplier,
      undefined,
      building.mainFloorHeight * TILE_SIZE,
      multiplier,
      dpi
    )

    // middle floors
    const randomGenerator = seedrandom(generateRandSeed())

    for (let i = 1; i < floors; i++) {
      const variant =
        building.variantsCount === 0
          ? 0
          : Math.floor(randomGenerator() * building.variantsCount) + 1

      drawSegmentImage(
        spriteId,
        ctx,
        0,
        height -
          building.mainFloorHeight * TILE_SIZE * TILESET_POINT_PER_PIXEL -
          building.floorHeight * TILE_SIZE * variant * TILESET_POINT_PER_PIXEL,
        // 168 - (building.floorHeight * TILE_SIZE * variant), // 0 - 240 + (120 * building.variantsCount) - (building.floorHeight * TILE_SIZE * variant),
        undefined,
        building.floorHeight * TILE_SIZE,
        offsetLeft + leftPosShift * multiplier,
        offsetTop +
          buildingHeight * multiplier -
          (building.mainFloorHeight + building.floorHeight * i) *
            TILE_SIZE *
            multiplier,
        undefined,
        building.floorHeight * TILE_SIZE,
        multiplier,
        dpi
      )
    }

    // roof
    drawSegmentImage(
      spriteId,
      ctx,
      0,
      height -
        building.mainFloorHeight * TILE_SIZE * TILESET_POINT_PER_PIXEL -
        building.floorHeight *
          TILE_SIZE *
          building.variantsCount *
          TILESET_POINT_PER_PIXEL -
        building.roofHeight * TILE_SIZE * TILESET_POINT_PER_PIXEL,
      undefined,
      building.roofHeight * TILE_SIZE,
      offsetLeft + leftPosShift * multiplier,
      offsetTop +
        buildingHeight * multiplier -
        (building.mainFloorHeight +
          building.floorHeight * (floors - 1) +
          building.roofHeight) *
          TILE_SIZE *
          multiplier,
      undefined,
      building.roofHeight * TILE_SIZE,
      multiplier,
      dpi
    )
  } else {
    // Single floor buildings
    // Determine how much tiling happens
    const count = Math.floor(totalWidth / width) + 2

    let currentX
    for (let i = 0; i < count; i++) {
      if (i === 0 && typeof firstX !== 'undefined') {
        currentX = firstX
      } else if (i === count - 1 && typeof lastX !== 'undefined') {
        currentX = lastX
      } else {
        currentX = x
      }

      drawSegmentImage(
        spriteId,
        ctx,
        currentX,
        undefined,
        width,
        undefined,
        offsetLeft + (leftPosShift + i * width) * multiplier,
        offsetTop,
        width,
        undefined,
        multiplier,
        dpi
      )
    }
  }

  // If street width is exceeded, fade buildings
  // Note: it would make sense to also fade out buildings when drawing large canvases but that would
  // shade in the entire background erroneously
  if (shadeIn === true) {
    shadeInContext(ctx)
  }
}

/**
 * Fills the building rendered area with a color
 *
 * @param {CanvasRenderingContext2D} ctx
 */
function shadeInContext (ctx) {
  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  // TODO const
  ctx.fillStyle = 'rgba(204, 163, 173, .9)'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.restore()
}

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

  drawBuilding(
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
