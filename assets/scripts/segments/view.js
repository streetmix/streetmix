/* global system, debug */
/* global images */
export function drawSegmentImageSVG (id, ctx, dx, dy, dw, dh) {
  if (!dw || !dh || dw <= 0 || dh <= 0) {
    return
  }

  // Set render dimensions based on pixel density
  dx *= system.hiDpi
  dy *= system.hiDpi
  dw *= system.hiDpi
  dh *= system.hiDpi

  // These rectangles are telling us that we're drawing at the right places.
  if (debug.canvasRectangles) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillRect(dx, dy, dw, dh)
  }

  // Draw the image to canvas
  const img = images[id]
  ctx.drawImage(img, dx, dy, dw, dh)
}
