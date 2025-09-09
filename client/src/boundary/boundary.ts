import seedrandom from 'seedrandom'
import { round } from '@streetmix/utils'

import BOUNDARY_DEFS from '../boundary/boundary_defs.yaml'
import { generateRandSeed } from '../util/random'
import { prettifyWidth } from '../util/width_units'
import { images } from '../app/load_resources'
import store from '../store'
import { SETTINGS_UNITS_METRIC } from '../users/constants'
import {
  TILE_SIZE,
  TILESET_POINT_PER_PIXEL,
  BUILDING_LEFT_POSITION,
  CURB_HEIGHT
} from '../segments/constants'
import { drawSegmentImage, getElevation } from '../segments/view'

import type { IntlShape } from 'react-intl'
import type {
  BoundaryDefinition,
  BoundaryPosition,
  UnitsSetting
} from '@streetmix/types'

export const GROUND_BASELINE_HEIGHT = 44

const INVALID_SHADE_COLOUR = 'rgba(204, 163, 173, .9)'

export function getBoundaryItem (variant: string): BoundaryDefinition {
  const item = BOUNDARY_DEFS[variant]
  if (item.id === undefined) {
    item.id = variant
  }

  return item
}

/**
 * Returns sprite id, given variant and position
 */
function getSpriteId (variant: string, position: BoundaryPosition): string {
  const item = getBoundaryItem(variant)
  return item.spriteId + (item.sameOnBothSides === true ? '' : '-' + position)
}

/**
 * Calculate boundary image height. For buildings that do not have multiple
 * floors, this is just the image's intrinsic height value. For buildings with
 * multiple floors, this must be calculated from the number of floors and
 * sprite pixel specifications.
 */
export function getBoundaryImageHeight (
  variant: string,
  position: BoundaryPosition,
  floors = 1
): number {
  const item = getBoundaryItem(variant)
  let height

  if (item.hasFloors) {
    height =
      (item.roofHeight +
        item.floorHeight * (floors - 1) +
        item.mainFloorHeight) *
      TILE_SIZE
  } else {
    const id = getSpriteId(variant, position)
    const svg = images.get(id)
    height = svg.height / TILESET_POINT_PER_PIXEL
  }

  return height
}

/**
 * Converts the number of floors to an actual height in meters
 */
function calculateRealHeightNumber (
  variant: string,
  position: BoundaryPosition,
  floors: number
): number {
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
 */
export function prettifyHeight (
  variant: string,
  position: BoundaryPosition,
  floors: number,
  units: UnitsSetting,
  formatMessage: IntlShape['formatMessage']
): string {
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
  const locale = store.getState().locale.locale
  const prettifiedHeight = prettifyWidth(realHeight, units, locale)

  text += ` (${prettifiedHeight})`

  return text
}

/**
 * Draws boundary item on a canvas
 */
export function drawBoundary (
  ctx: CanvasRenderingContext2D,
  position: BoundaryPosition,
  variant: string,
  elevation: number,
  floors: number,
  totalWidth: number,
  totalHeight: number,
  offsetLeft: number,
  multiplier: number,
  dpi: number,
  shadeIn = false
): void {
  const item = getBoundaryItem(variant)

  const spriteId = getSpriteId(variant, position)
  const svg = images.get(spriteId)

  const buildingHeight = getBoundaryImageHeight(variant, position, floors)
  let offsetTop =
    totalHeight -
    buildingHeight * multiplier -
    getElevation(elevation) * multiplier

  // Adjust offset if the building should be aligned at baseline instead of ground plane
  if (item.alignAtBaseline === true) {
    offsetTop += GROUND_BASELINE_HEIGHT
  }

  // Some building sprites tile itself, while others tile just half of it
  let width, x, lastX, firstX
  if (item.repeatHalf === true) {
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
    if (!item.hasFloors) {
      // takes into consideration tiling
      leftPosShift = (totalWidth % width) - (width + width)
    } else {
      leftPosShift = totalWidth - width
    }
  }

  // Multifloor buildings
  if (item.hasFloors) {
    const height = svg.height // actual pixels, don't need to divide by TILESET_POINT_PER_PIXEL

    // bottom floor
    drawSegmentImage(
      spriteId,
      ctx,
      0,
      height - item.mainFloorHeight * TILE_SIZE * TILESET_POINT_PER_PIXEL, // 0 - 240 + (120 * item.variantsCount),
      undefined,
      item.mainFloorHeight * TILE_SIZE,
      offsetLeft + leftPosShift * multiplier,
      offsetTop +
        (buildingHeight - item.mainFloorHeight * TILE_SIZE) * multiplier,
      undefined,
      item.mainFloorHeight * TILE_SIZE,
      multiplier,
      dpi
    )

    // middle floors
    const randomGenerator = seedrandom(generateRandSeed())

    for (let i = 1; i < floors; i++) {
      const count = item.variantsCount ?? 0
      const variant = count > 0 ? Math.floor(randomGenerator() * count) + 1 : 0

      drawSegmentImage(
        spriteId,
        ctx,
        0,
        height -
          item.mainFloorHeight * TILE_SIZE * TILESET_POINT_PER_PIXEL -
          item.floorHeight * TILE_SIZE * variant * TILESET_POINT_PER_PIXEL,
        // 168 - (item.floorHeight * TILE_SIZE * variant), // 0 - 240 + (120 * item.variantsCount) - (item.floorHeight * TILE_SIZE * variant),
        undefined,
        item.floorHeight * TILE_SIZE,
        offsetLeft + leftPosShift * multiplier,
        offsetTop +
          buildingHeight * multiplier -
          (item.mainFloorHeight + item.floorHeight * i) *
            TILE_SIZE *
            multiplier,
        undefined,
        item.floorHeight * TILE_SIZE,
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
        item.mainFloorHeight * TILE_SIZE * TILESET_POINT_PER_PIXEL -
        item.floorHeight *
          TILE_SIZE *
          (item.variantsCount ?? 0) *
          TILESET_POINT_PER_PIXEL -
        item.roofHeight * TILE_SIZE * TILESET_POINT_PER_PIXEL,
      undefined,
      item.roofHeight * TILE_SIZE,
      offsetLeft + leftPosShift * multiplier,
      offsetTop +
        buildingHeight * multiplier -
        (item.mainFloorHeight +
          item.floorHeight * (floors - 1) +
          item.roofHeight) *
          TILE_SIZE *
          multiplier,
      undefined,
      item.roofHeight * TILE_SIZE,
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
  // Note: it would make sense to also fade out buildings when drawing large
  // canvases but that would shade in the entire background erroneously
  if (shadeIn) {
    shadeInContext(ctx)
  }
}

/**
 * Fills the building rendered area with a color
 */
function shadeInContext (ctx: CanvasRenderingContext2D): void {
  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  ctx.fillStyle = INVALID_SHADE_COLOUR
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.restore()
}
