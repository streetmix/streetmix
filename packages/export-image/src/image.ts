// import { TILE_SIZE, BUILDING_SPACE } from '../../../client/src/segments/constants.js'
// import { getBuildingImageHeight } from '../../../client/src/segments/buildings.js'
import path from 'node:path'
import url from 'node:url'
import * as Canvas from '@napi-rs/canvas'

import { drawWatermark } from './watermark.js'

import type { Street, StreetImageOptions } from '@streetmix/types'

// Set up some legacy Node.js globals for convenience
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Register fonts
// We will not be using variable fonts here because canvas support doesn't
// exist yet. See https://github.com/Brooooooklyn/canvas/issues/495
Canvas.GlobalFonts.registerFromPath(
  path.join(
    __dirname,
    '../../../node_modules/@fontsource/rubik/files/rubik-latin-400-normal.woff2'
  ),
  'Rubik'
)
Canvas.GlobalFonts.registerFromPath(
  path.join(
    __dirname,
    '../../../node_modules/@fontsource/rubik/files/rubik-latin-600-normal.woff2'
  ),
  'Rubik'
)
Canvas.GlobalFonts.registerFromPath(
  path.join(
    __dirname,
    '../../../node_modules/@fontsource/overpass/files/overpass-latin-700-normal.woff2'
  ),
  'Overpass'
)

const IMAGE_MIN_HEIGHT = 400
const IMAGE_MIN_HEIGHT_WITH_STREET_NAME = IMAGE_MIN_HEIGHT + 150
const IMAGE_BOTTOM_PADDING = 60
const IMAGE_NAMES_WIDTHS_PADDING = 65

// copy paste values witout importing for now
const TILE_SIZE = 12 / 0.3048 // pixels, using imperial conversion rate to preserve render scale
const BUILDING_SPACE = 360

export async function makeStreetImage (
  street: Street,
  options: StreetImageOptions
): Promise<Buffer> {
  const width = calculateImageWidth(street, options)
  const height = calculateImageHeight(street, options)

  const canvas = Canvas.createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // drawStreetThumbnail(ctx, street, {
  //   width,
  //   height,
  //   dpi,
  //   multiplier: 1.0,
  //   silhouette: false,
  //   bottomAligned: true,
  //   transparentSky,
  //   segmentLabels,
  //   streetName,
  //   watermark
  // })
  try {
    if (options.watermark) {
      // Watermark is inverted (white) if segment labels are shown
      await drawWatermark(ctx, options.scale, !options.segmentLabels)
    }
  } catch (err) {
    console.error(err)
  }

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

  // Test rendering an SVG
  try {
    // Must assemble path with __dirname to read from filesystem
    const image = await Canvas.loadImage(
      path.join(__dirname, '../assets/planter-box.svg')
    )

    // Set the width and height here to scale properly
    image.width = image.width * options.scale
    image.height = image.height * options.scale

    // Draw the image; don't use the dw and dh arguments for scaling, it will
    // be pixelated. That's why we set the width/height properties earlier.
    ctx.rotate(0.1)
    ctx.drawImage(image, 80, 80)
  } catch (err) {
    console.error(err)
  }

  return await canvas.encode('png')
}

function calculateImageWidth (
  street: Street,
  options: StreetImageOptions
): number {
  const streetData = street.data.street
  // TODO: explain what * 2 is
  const baseWidth = TILE_SIZE * streetData.width + BUILDING_SPACE * 2
  return baseWidth * options.scale
}

function calculateImageHeight (
  street: Street,
  options: StreetImageOptions
): number {
  // const streetData = street.data.street
  const { streetName, segmentLabels } = options

  // TODO: we can't do a real calc yet because we don't have access to assets
  // const leftHeight = getBuildingImageHeight(
  //   streetData.leftBuildingVariant,
  //   'left',
  //   streetData.leftBuildingHeight
  // )
  // const rightHeight = getBuildingImageHeight(
  //   streetData.rightBuildingVariant,
  //   'right',
  //   streetData.rightBuildingHeight
  // )

  let height = 500 // Math.max(leftHeight, rightHeight)

  if (height < IMAGE_MIN_HEIGHT) {
    height = IMAGE_MIN_HEIGHT
  }

  if (streetName && height < IMAGE_MIN_HEIGHT_WITH_STREET_NAME) {
    height = IMAGE_MIN_HEIGHT_WITH_STREET_NAME
  }

  height += IMAGE_BOTTOM_PADDING

  if (segmentLabels) {
    height += IMAGE_NAMES_WIDTHS_PADDING
  }

  return height * options.scale
}
