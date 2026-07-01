import { TILE_SIZE } from './constants.js'

import type * as Canvas from '@napi-rs/canvas'
import { getBoundaryItem } from '@streetmix/parts'
import type { StreetJson } from '@streetmix/types'

const BACKGROUND_EARTH_COLOUR = 'rgb(53, 45, 39)'

/**
 * Draws earth (soil and dirt below ground).
 *
 * @modifies {Canvas.SKRSContext2D} ctx
 */
export function drawEarth(
  ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D,
  street: StreetJson,
  width: number,
  horizonLine: number,
  groundLevel: number,
  scale: number
): void {
  // Save previous canvas context
  ctx.save()

  // Set style
  ctx.fillStyle = BACKGROUND_EARTH_COLOUR

  // Earth below entire street
  ctx.fillRect(0, horizonLine * scale, width * scale, 25 * scale)

  // Get elevation at boundaries if they are set to something
  // The `boundary` property does not exist prior to schema version 31,
  // and gallery will still need to render data that doesn't have it.
  let leftElevation = 0
  let rightElevation = 0

  const leftBoundary = street.boundary?.left
  const rightBoundary = street.boundary?.right
  const leftBoundaryDefinition = getBoundaryItem(
    leftBoundary?.variant ?? street.leftBuildingVariant
  )
  const rightBoundaryDefinition = getBoundaryItem(
    rightBoundary?.variant ?? street.rightBuildingVariant
  )

  if (leftBoundary?.elevation > 0) {
    leftElevation = leftBoundary.elevation * TILE_SIZE
  }
  if (rightBoundary?.elevation > 0) {
    rightElevation = street.boundary.right.elevation * TILE_SIZE
  }

  if (leftBoundaryDefinition.earthColor) {
    ctx.fillStyle = leftBoundaryDefinition.earthColor
  }

  // Earth below left boundary
  ctx.fillRect(
    0,
    (groundLevel - leftElevation) * scale,
    (width / 2 - (street.width * TILE_SIZE) / 2) * scale,
    horizonLine * scale
  )

  if (rightBoundaryDefinition.earthColor) {
    ctx.fillStyle = rightBoundaryDefinition.earthColor
  } else {
    // Reset to default background color
    ctx.fillStyle = BACKGROUND_EARTH_COLOUR
  }

  // Earth below right boundary
  ctx.fillRect(
    (width / 2 + (street.width * TILE_SIZE) / 2) * scale,
    (groundLevel - rightElevation) * scale,
    width * scale,
    horizonLine * scale
  )

  // Restore previous canvas context
  ctx.restore()
}
