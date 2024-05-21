import path from 'node:path'
import url from 'node:url'
import Canvas, { GlobalFonts } from '@napi-rs/canvas'

// Set up some legacy Node.js globals for convenience
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Register fonts
// We will not be using variable fonts here because canvas support doesn't
// exist yet. See https://github.com/Brooooooklyn/canvas/issues/495
GlobalFonts.registerFromPath(
  path.join(
    __dirname,
    '../../../node_modules/@fontsource/rubik/files/rubik-latin-400-normal.woff2'
  ),
  'Rubik'
)
GlobalFonts.registerFromPath(
  path.join(
    __dirname,
    '../../../node_modules/@fontsource/rubik/files/rubik-latin-600-normal.woff2'
  ),
  'Rubik'
)
GlobalFonts.registerFromPath(
  path.join(
    __dirname,
    '../../../node_modules/@fontsource/overpass/files/overpass-latin-700-normal.woff2'
  ),
  'Overpass'
)

export async function runTestCanvas () {
  const canvas = Canvas.createCanvas(800, 800)
  const ctx = canvas.getContext('2d')

  // Write "Awesome!"
  ctx.font = '400 30px Rubik'
  ctx.fillText('Awesome!', 50, 100)

  // Draw line under text
  const text = ctx.measureText('Awesome!')
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath()
  ctx.lineTo(50, 102)
  ctx.lineTo(50 + text.width, 102)
  ctx.stroke()

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
    ctx.rotate(0.1)
    ctx.drawImage(wordmark, 80, 80)
  } catch (err) {
    console.error(err)
  }

  const buffer = await canvas.encode('png')

  return buffer
}
