import {
  BOUNDARY_WIDTH,
  GROUND_BASELINE_HEIGHT,
  TILE_SIZE,
} from './constants.js'

import type * as Canvas from '@napi-rs/canvas'
import type { FloodDetails, StreetState } from '@streetmix/types'

// Wave image is rendered at 8px tall, so we half it to render an "average".
// It is doubled again in a surge.
const HALF_OF_WAVE_HEIGHT = 8 / 2
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
  // surge effect a little, that is not being done here right now because we
  // haven't scaled up the waves to draw that effect.
  const rise = Math.max(left?.rise ?? 0, right?.rise ?? 0)
  const floodHeight = rise * TILE_SIZE - HALF_OF_WAVE_HEIGHT
  // const floodHeight = rise * TILE_SIZE - HALF_OF_WAVE_HEIGHT * (stormSurge ? 2 : 1)
  const waterY = groundLevel - floodHeight
  const waterHeight = GROUND_BASELINE_HEIGHT + floodHeight

  // Draw flood
  // If either left or right is "max", means we flood the entire image.
  if (left?.distance === 'max' || right?.distance === 'max') {
    // Draw water
    ctx.fillRect(0, waterY * scale, width * scale, waterHeight * scale)

    // Draw waves on top
    await drawSeaLevelWaves(ctx, 0, waterY, width, scale)
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
        waterY * scale,
        (BOUNDARY_WIDTH + leftDistance) * scale,
        waterHeight * scale
      )

      await drawSeaLevelWaves(
        ctx,
        0,
        waterY,
        BOUNDARY_WIDTH + leftDistance,
        scale
      )
    }
    if (typeof right?.distance === 'number') {
      ctx.fillRect(
        (width - BOUNDARY_WIDTH - rightDistance) * scale,
        waterY * scale,
        (BOUNDARY_WIDTH + rightDistance) * scale,
        waterHeight * scale
      )

      await drawSeaLevelWaves(
        ctx,
        width - BOUNDARY_WIDTH - rightDistance,
        waterY,
        BOUNDARY_WIDTH + rightDistance,
        scale
      )
    }
  }

  // Restore previous canvas context
  ctx.restore()
}

// base64 representation of waves-right.svg (this avoids file loading and
// transpilation problems, but shouldn't be here long term)
const WAVES_IMAGE =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjIiIGNsaXAtcnVsZT0iZXZlbm9kZCIgd2lkdGg9IjMwNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDMwNiAxNiI+PHBhdGggZmlsbD0iIzM2NjM4NyIgZmlsbC1ydWxlPSJub256ZXJvIiBkPSJNMjc4Ljk1NSAxMy4xOCAyMDMuNDE3IDYuNjZsLTMuNjA2IDUuODkzLTc3LjA5My04LjIwNS01LjkwMiA4LjkyMi02Mi44ODItNi45MjctMi43ODMgNC42NUwtLjEgMy44ODdWMTdoMzA2LjJWNC4wNzlMMjgzLjgzLjk5OXoiLz48L3N2Zz4='
const WAVES_IMAGE_URL = `data:image/svg+xml;base64,${WAVES_IMAGE}`

// Draw waves
async function drawSeaLevelWaves(
  ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D,
  posX: number,
  posY: number,
  width: number,
  scale: number
) {
  ctx.save()

  // Image is only available on browser
  // Will need to do a loadImage() from @napi-rs/canvas for server (but parcel
  // doesn't like bundling @napi-rs/canvas so we have to deal with that first)
  const image = new Image()
  image.src = WAVES_IMAGE_URL

  // TODO: waves are not scaling properly at higher resolutions.
  await image.decode()
  image.width = image.naturalWidth * scale
  image.height = image.naturalHeight * scale

  // Define the wave image as a repeating pattern.
  // @ts-expect-error will address @napi-rs/canvas type mismatch later
  const pattern = ctx.createPattern(image, 'repeat-x')
  if (pattern === null) throw new Error('pattern did not load')

  const rectX = posX * scale
  const rectY = posY * scale - image.naturalHeight
  const rectW = width * scale
  const rectH = image.naturalHeight

  // Patterns based on the canvas coordinate space, so it's actually drawn
  // at (0, 0) and repeats only along the top of the canvas. We need to shift
  // the pattern down to where we expect sea level to be.
  pattern.setTransform(new DOMMatrix().translate(0, rectY))
  ctx.fillStyle = pattern

  // Draw!!
  ctx.fillRect(rectX, rectY, rectW, rectH)

  // Restore previous canvas context
  ctx.restore()
}
