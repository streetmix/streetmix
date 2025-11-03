import { TILE_SIZE } from './constants.js'

import type * as Canvas from '@napi-rs/canvas'
import type { StreetJson } from '@streetmix/types'

const BACKGROUND_DIRT_COLOUR = 'rgb(53, 45, 39)'

/**
 * Draws ground.
 *
 * @modifies {CanvasRenderingContext2D} ctx
 */
export function drawGround (
  ctx: Canvas.SKRSContext2D,
  street: StreetJson,
  width: number,
  horizonLine: number,
  groundLevel: number,
  scale: number
): void {
  // Save previous canvas context
  ctx.save()

  // Draw ground
  ctx.fillStyle = BACKGROUND_DIRT_COLOUR

  // Ground below entire street
  ctx.fillRect(0, horizonLine * scale, width * scale, 25 * scale)

  // Get elevation at boundaries if they are set to something
  // The `boundary` property does not exist prior to schema version 31,
  // and gallery will still need to render data that doesn't have it.
  // There are intermediary schemas where the boundary property did
  // not use real units (they were using 0 or 1) but these don't exist
  // in the wild, so don't bother handling this case
  let leftElevation = 0
  let rightElevation = 0
  if (street.boundary?.left.elevation > 0) {
    leftElevation = street.boundary.left.elevation * TILE_SIZE
  }
  if (street.boundary?.right.elevation > 0) {
    rightElevation = street.boundary.right.elevation * TILE_SIZE
  }

  // Ground below left boundary
  ctx.fillRect(
    0,
    (groundLevel - leftElevation) * scale,
    (width / 2 - (street.width * TILE_SIZE) / 2) * scale,
    horizonLine * scale
  )

  // Ground below right boundary
  ctx.fillRect(
    (width / 2 + (street.width * TILE_SIZE) / 2) * scale,
    (groundLevel - rightElevation) * scale,
    width * scale,
    horizonLine * scale
  )

  // Restore previous canvas context
  ctx.restore()
}
