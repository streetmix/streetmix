import path from 'node:path'
import url from 'node:url'
import Canvas from '@napi-rs/canvas'

// Set up some legacy Node.js globals for convenience
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function runTestCanvas () {
  const canvas = Canvas.createCanvas(800, 800)
  const ctx = canvas.getContext('2d')

  // Write "Awesome!"
  ctx.font = '30px Impact'
  ctx.rotate(0.1)
  ctx.fillText('Awesome!', 50, 100)

  // Draw line under text
  const text = ctx.measureText('Awesome!')
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath()
  ctx.lineTo(50, 102)
  ctx.lineTo(50 + text.width, 102)
  ctx.stroke()

  // Reset context rotation from previous
  ctx.rotate(-0.1)

  // Test wordmark
  try {
    // Must assemble path with __dirname to read from filesystem
    const wordmark = await Canvas.loadImage(
      path.join(__dirname, './wordmark_black.svg')
    )

    // Set the width and height here to scale properly
    wordmark.width = wordmark.width * 4
    wordmark.height = wordmark.height * 4

    // Draw the image; don't use the dw and dh arguments for scaling, it will
    // be pixelated. That's why we set the width/height properties earlier.
    ctx.drawImage(wordmark, 30, 30)
  } catch (err) {
    console.error(err)
  }

  const buffer = await canvas.encode('png')

  return buffer
}
