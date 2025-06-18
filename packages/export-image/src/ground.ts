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

  // Ground below building areas
  ctx.fillRect(
    0,
    groundLevel * scale,
    (width / 2 - (street.width * TILE_SIZE) / 2) * scale,
    horizonLine * scale
  )

  ctx.fillRect(
    (width / 2 + (street.width * TILE_SIZE) / 2) * scale,
    groundLevel * scale,
    width * scale,
    horizonLine * scale
  )

  // Restore previous canvas context
  ctx.restore()
}
