function _drawLine (ctx, x1, y1, x2, y2) {
  x1 *= system.hiDpi
  y1 *= system.hiDpi
  x2 *= system.hiDpi
  y2 *= system.hiDpi

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function _drawArrowLine (ctx, x1, y1, x2, y2, text) {
  x1 += 2
  x2 -= 2

  _drawLine(ctx, x1, y1, x2, y2)

  if (text) {
    ctx.font = (12 * system.hiDpi) + 'px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(text, (x1 + x2) / 2 * system.hiDpi, y1 * system.hiDpi - 10)
  }
}
