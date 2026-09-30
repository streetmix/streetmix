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
export async function drawSeaLevelRise(
  ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D,
  street: StreetState,
  floodDetails: [FloodDetails | null, FloodDetails | null],
  stormSurge: boolean,
  width: number,
  groundLevel: number,
  scale: number
): Promise<void> {
  const [left, right] = floodDetails

  // Save previous canvas context
  ctx.save()

  // Set style
  ctx.globalAlpha = FLOOD_ALPHA
  ctx.fillStyle = FLOOD_COLOR

  // Actual height of sea level rise to draw. In the UI we enlarge the storm
  // surge effect a little, that is not being done in the image export.
  const rise = Math.max(left?.rise ?? 0, right?.rise ?? 0)
  const floodHeight = rise * TILE_SIZE

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
  try {
    const file =
      'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjIiIGNsaXAtcnVsZT0iZXZlbm9kZCIgd2lkdGg9IjMwNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDMwNiAxNiI+PHBhdGggZmlsbD0iIzM2NjM4NyIgZmlsbC1ydWxlPSJub256ZXJvIiBkPSJNMjc4Ljk1NSAxMy4xOCAyMDMuNDE3IDYuNjZsLTMuNjA2IDUuODkzLTc3LjA5My04LjIwNS01LjkwMiA4LjkyMi02Mi44ODItNi45MjctMi43ODMgNC42NUwtLjEgMy44ODdWMTdoMzA2LjJWNC4wNzlMMjgzLjgzLjk5OXoiLz48L3N2Zz4='
    const image = new Image()
    image.src = `data:image/svg+xml;base64,${file}`

    await image.decode()
    image.width = image.naturalWidth * scale
    image.height = image.naturalHeight * scale

    // @ts-expect-error will address @napi-rs typecheck later.
    ctx.drawImage(image, 100, 100, image.width, image.height)
  } catch (err) {
    console.log(err)
  } finally {
    // Restore previous canvas context
    ctx.restore()
  }
}
