export function drawLine (ctx, x1, y1, x2, y2, dpi) {
  x1 *= dpi
  y1 *= dpi
  x2 *= dpi
  y2 *= dpi

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

export function drawArrowLine (ctx, x1, y1, x2, y2, text, dpi) {
  x1 += 2
  x2 -= 2

  drawLine(ctx, x1, y1, x2, y2, dpi)

  if (text) {
    ctx.font = 12 * dpi + 'px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(text, ((x1 + x2) / 2) * dpi, y1 * dpi - 10)
  }
}
