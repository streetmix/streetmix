// import { TILE_SIZE, BUILDING_SPACE } from '../../../client/src/segments/constants.js'
// import { getBuildingImageHeight } from '../../../client/src/segments/buildings.js'
import path from 'node:path'
import url from 'node:url'
import * as Canvas from '@napi-rs/canvas'

import type { Street } from '@streetmix/types'

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

// Must assemble path with __dirname to read from filesystem
const WORDMARK_DARK = await Canvas.loadImage(
  path.join(__dirname, '../assets/wordmark_black.svg')
)
const WORDMARK_LIGHT = await Canvas.loadImage(
  path.join(__dirname, '../assets/wordmark_black.svg')
)

// This can be adjusted to create much more hi-definition images
const DEFAULT_IMAGE_SCALE = 1.0 // 2.0

const IMAGE_MIN_HEIGHT = 400
const IMAGE_MIN_HEIGHT_WITH_STREET_NAME = IMAGE_MIN_HEIGHT + 150
const IMAGE_BOTTOM_PADDING = 60
const IMAGE_NAMES_WIDTHS_PADDING = 65

// copy paste values witout importing for now
const TILE_SIZE = 12 / 0.3048 // pixels, using imperial conversion rate to preserve render scale
const BUILDING_SPACE = 360

interface StreetImageOptions {
  transparentSky: boolean
  segmentNamesAndWidths: boolean
  streetName: boolean
  watermark: boolean
  scale: number // formerly `dpi`
}

export async function makeStreetImage (
  street: Street,
  opts: Partial<StreetImageOptions> = {}
): Promise<Buffer> {
  // Default options
  const options: StreetImageOptions = {
    transparentSky: false,
    segmentNamesAndWidths: true,
    streetName: true,
    watermark: true,
    scale: DEFAULT_IMAGE_SCALE,
    ...opts
  }

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
  //   segmentNamesAndWidths,
  //   streetName,
  //   watermark
  // })
  try {
    drawWatermark(ctx, options.scale)
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
  const { streetName, segmentNamesAndWidths } = options

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

  if (segmentNamesAndWidths) {
    height += IMAGE_NAMES_WIDTHS_PADDING
  }

  return height * options.scale
}

// -- WATERMARK

const WATERMARK_FONT = 'Rubik'
const WATERMARK_FONT_SIZE = 24
const WATERMARK_FONT_WEIGHT = '600'
const WATERMARK_RIGHT_MARGIN = 15
const WATERMARK_BOTTOM_MARGIN = 15
const WATERMARK_DARK_COLOR = '#333333'
const WATERMARK_LIGHT_COLOR = '#cccccc'

const WORDMARK_MARGIN = 4

/**
 * Draws a "made with Streetmix" watermark on the lower right of the image.
 *
 * @todo Make it work with rtl
 * @modifies {Canvas.SKRSContext2D}
 */
function drawWatermark (
  ctx: Canvas.SKRSContext2D,
  scale: number,
  invert: boolean = false
): void {
  // const text = formatMessage(
  //   'export.watermark',
  //   'Made with {streetmixWordmark}',
  //   {
  //     // Replace the {placeholder} with itself. Later, this is used to
  //     // render the logo image in place of the text.
  //     streetmixWordmark: '{streetmixWordmark}'
  //   }
  // )
  const text = 'Made with {streetmixWordmark}'
  const wordmarkImage = invert ? WORDMARK_LIGHT : WORDMARK_DARK

  // Set the width and height here to scale properly
  // Plus divide by 4 because source image is larger
  wordmarkImage.width = (wordmarkImage.width * scale) / 4
  wordmarkImage.height = (wordmarkImage.height * scale) / 4

  // Separate string so that we can render a wordmark with an image
  const strings = text.replace(/{/g, '||{').replace(/}/g, '}||').split('||')

  // Save previous context
  ctx.save()

  // Set text render options
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `normal ${WATERMARK_FONT_WEIGHT} ${
    WATERMARK_FONT_SIZE * scale
  }px ${WATERMARK_FONT},sans-serif`
  ctx.fillStyle = invert ? WATERMARK_LIGHT_COLOR : WATERMARK_DARK_COLOR

  // Set starting X/Y positions so that watermark is aligned right and bottom of image
  const startRightX = ctx.canvas.width - WATERMARK_RIGHT_MARGIN * scale
  const startBottomY = ctx.canvas.height - WATERMARK_BOTTOM_MARGIN * scale

  // Set wordmark width and height based on image scale
  const logoWidth = wordmarkImage.width
  const logoHeight = wordmarkImage.height

  // Keep track of where we are on the X-position.
  let currentRightX = startRightX

  // Render each part of the string.
  for (let i = strings.length - 1; i >= 0; i--) {
    const string = strings[i]

    // If we see the wordmark placeholder, render the image.
    if (string === '{streetmixWordmark}') {
      const margin = WORDMARK_MARGIN * scale
      const logoLeftX = currentRightX - logoWidth - margin
      const logoTopY = startBottomY - logoHeight + scale // Additional adjustment for visual alignment

      ctx.drawImage(wordmarkImage, logoLeftX, logoTopY)

      // Update X position.
      currentRightX = logoLeftX - margin
    } else {
      ctx.fillText(string, currentRightX, startBottomY)

      // Update X position.
      currentRightX = currentRightX - ctx.measureText(string).width
    }
  }

  // Restore previous context
  ctx.restore()
}
