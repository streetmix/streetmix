/* global system, debug */
/* global Blob, Image */
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

    // ctx.drawImage() can only draw things that are images (so you can't draw)
    // an SVG directly. <use> doesn't seem to work directly (maybe <use> inside an
    // image blob doesn't have access to the SVGs on the page?)
    // So we have to create an image using a reconstructed SVG as a data blob.
    var svgId = 'image-' + id
    var svgImage = document.getElementById(svgId)
    var svgInternals = svgImage.innerHTML

    // We need the namespacing and the original viewBox
    // The other SVG attributes don't seem necessary (tested on Chrome)
    var svgHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="' + svgImage.getAttribute('viewBox') + '">' +
      svgInternals +
      '</svg>'

    var svgBlob = new Blob([svgHTML], { type: 'image/svg+xml;charset=utf-8' })
    var img = new Image()

    img.src = window.URL.createObjectURL(svgBlob)
    img.onload = function () {
      ctx.drawImage(img, dx, dy, dw, dh)
    }
  }
}
