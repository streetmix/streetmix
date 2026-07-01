import * as Canvas from '@napi-rs/canvas'

const SILHOUETTE_FILL_COLOUR = 'rgb(240, 240, 240)'

/**
 * Turns drawn objects on canvas into a single-colour silhouette
 * NOTE: possibly deprecated, nothing else is currently using it.
 * May be bugged, it fills the entire canvas, not just the slices
 */
export function drawSilhouette(
  ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number
): void {
  ctx.save()

  ctx.globalCompositeOperation = 'source-atop'
  ctx.fillStyle = SILHOUETTE_FILL_COLOUR
  ctx.fillRect(0, 0, width * scale, height * scale)

  ctx.restore()
}
