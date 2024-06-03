import { TILE_SIZE } from './constants.js'

import type * as Canvas from '@napi-rs/canvas'
import type { Street } from '@streetmix/types'

const BACKGROUND_DIRT_COLOUR = 'rgb(53, 45, 39)'

/**
 * Draws ground.
 *
 * @modifies {CanvasRenderingContext2D} ctx
 */
export function drawGround (
  ctx: Canvas.SKRSContext2D,
  street: Street,
  width: number,
  scale: number,
  horizonLine: number,
  groundLevel: number
): void {
  // Save previous canvas context
  ctx.save()

  // Draw ground
  ctx.fillStyle = BACKGROUND_DIRT_COLOUR

  // Ground below entire street
  ctx.fillRect(0, horizonLine, width, 25 * scale)

  // Ground below building areas
  ctx.fillRect(
    0,
    groundLevel,
    width / 2 - (street.data.street.width * TILE_SIZE * scale) / 2,
    20 * scale
  )

  ctx.fillRect(
    width / 2 + (street.data.street.width * TILE_SIZE * scale) / 2,
    groundLevel,
    width,
    20 * scale
  )

  // Restore previous canvas context
  ctx.restore()
}
