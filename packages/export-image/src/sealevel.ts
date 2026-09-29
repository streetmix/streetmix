import {
  BOUNDARY_WIDTH,
  GROUND_BASELINE_HEIGHT,
  TILE_SIZE,
} from './constants.js'

import type * as Canvas from '@napi-rs/canvas'
import type { FloodDetails, StreetState } from '@streetmix/types'

const FLOOD_COLOR = '#366387'
const FLOOD_ALPHA = 0.4

/**
 * Draws sea level rise
 *
 * @modifies {Canvas.SKRSContext2D} ctx
 */
export function drawSeaLevelRise(
  ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D,
  street: StreetState,
  floodDetails: [FloodDetails | null, FloodDetails | null],
  stormSurge: boolean,
  width: number,
  groundLevel: number,
  scale: number
): void {
  const [left, right] = floodDetails

  // Save previous canvas context
  ctx.save()

  // Set style
  ctx.globalAlpha = FLOOD_ALPHA
  ctx.fillStyle = FLOOD_COLOR

  // Actual height of flood to draw, including storm surge
  const HALF_OF_WAVE_HEIGHT = 8 / 2
  const rise = Math.max(left?.rise ?? 0, right?.rise ?? 0)
  const floodHeight =
    rise * TILE_SIZE + HALF_OF_WAVE_HEIGHT * (stormSurge ? 2 : 1)

  // Draw flood
  // If either left or right is "max", means we flood the entire image.
  if (left?.distance === 'max' || right?.distance === 'max') {
    ctx.fillRect(
      0,
      (groundLevel - floodHeight) * scale,
      width * scale,
      (GROUND_BASELINE_HEIGHT + floodHeight) * scale
    )
  } else {
    // The flooding distance is calculated from slices, and doesn't include
    // the remaining space (positive values is empty, negative values is overflow)
    // so we also need to add that here, then multiply by TILE_SIZE for the
    // pixel dimension
    const leftDistance =
      ((left?.distance ?? 0) + street.remainingWidth / 2) * TILE_SIZE
    const rightDistance =
      ((right?.distance ?? 0) + street.remainingWidth / 2) * TILE_SIZE

    if (typeof left?.distance === 'number') {
      ctx.fillRect(
        0,
        (groundLevel - floodHeight) * scale,
        (BOUNDARY_WIDTH + leftDistance) * scale,
        (GROUND_BASELINE_HEIGHT + floodHeight) * scale
      )
    }
    if (typeof right?.distance === 'number') {
      ctx.fillRect(
        (width - BOUNDARY_WIDTH - rightDistance) * scale,
        (groundLevel - floodHeight) * scale,
        (BOUNDARY_WIDTH + rightDistance) * scale,
        (GROUND_BASELINE_HEIGHT + floodHeight) * scale
      )
    }
  }
  // TODO: wave texture
  // This is a repeating SVG
  // so like a repeating texture, get the width of it
  // get the width to draw on
  // figure out how many to draw
  // the draw them

  // Restore previous canvas context
  ctx.restore()
}
