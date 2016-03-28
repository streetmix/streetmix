/* global system, debug */
/* global Blob, Image */
/* global images */
export function drawSegmentImageSVG (id, ctx, dx, dy, dw, dh) {
  if (!dw || !dh) {
    return
  }

  if ((dw > 0) && (dh > 0)) {
    dx *= system.hiDpi
    dy *= system.hiDpi
    dw *= system.hiDpi
    dh *= system.hiDpi

    // These rectangles are telling us that we're drawing at the right places.
    if (debug.canvasRectangles) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(dx, dy, dw, dh)
    }

    ctx.drawImage(images[id], dx, dy, dw, dh)
  }
}
