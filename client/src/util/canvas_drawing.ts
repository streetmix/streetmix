export function drawLine (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dpi: number
): void {
  x1 *= dpi
  y1 *= dpi
  x2 *= dpi
  y2 *= dpi

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

export function drawArrowLine (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  text: string | null,
  dpi: number
): void {
  x1 += 2
  x2 -= 2

  drawLine(ctx, x1, y1, x2, y2, dpi)

  if (text) {
    ctx.font = 12 * dpi + 'px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(text, ((x1 + x2) / 2) * dpi, y1 * dpi - 10)
  }
}
