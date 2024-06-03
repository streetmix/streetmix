// import { TILE_SIZE, BUILDING_SPACE } from '../../../client/src/segments/constants.js'
// import { getBuildingImageHeight } from '../../../client/src/segments/buildings.js'
import path from 'node:path'
import url from 'node:url'
import * as Canvas from '@napi-rs/canvas'

import { TILE_SIZE } from './constants.js'
import { drawGround } from './ground.js'
import { drawSegmentLabelBackground, drawSegmentLabels } from './labels.js'
import { drawNameplate } from './nameplate.js'
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
const BUILDING_SPACE = 360

export async function makeStreetImage (
  street: Street,
  options: StreetImageOptions
): Promise<Buffer> {
  // Easier to work in base width/height numbers first,
  // then multiply by scale _after_ all +/- calculations are done
  // Rule of thumb is, base number (e.g. scale = 1) if there are still
  // manipulations to be done. Apply scale ONLY when drawing to canvas
  const baseWidth = calculateImageWidth(street, options)
  const baseHeight = calculateImageHeight(street, options)

  const width = baseWidth * options.scale
  const height = baseHeight * options.scale

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

  // Calculations

  // Determine how wide the street is
  let occupiedWidth = 0
  for (const segment of street.data.street.segments) {
    occupiedWidth += segment.width
  }

  // Align things to bottom edge of image
  let offsetTop = baseHeight - 180
  if (options.segmentLabels) {
    offsetTop -= IMAGE_NAMES_WIDTHS_PADDING
  }

  const offsetLeft = (baseWidth - occupiedWidth * TILE_SIZE) / 2
  // const buildingOffsetLeft = (baseWidth - street.data.street.width * TILE_SIZE) / 2

  const groundLevel = offsetTop + 135
  const horizonLine = groundLevel + 20

  try {
    // Ground
    drawGround(ctx, street, baseWidth, horizonLine, groundLevel, options.scale)

    // Segment labels
    if (options.segmentLabels) {
      drawSegmentLabelBackground(
        ctx,
        baseWidth,
        baseHeight,
        groundLevel,
        options.scale
      )
      drawSegmentLabels(ctx, street, groundLevel, offsetLeft, options.scale)
    }

    // Street nameplate
    if (options.streetName) {
      drawNameplate(ctx, street, baseWidth, options.scale)
    }

    // Watermark
    if (options.watermark) {
      // Watermark is inverted (white) if segment labels are shown
      await drawWatermark(ctx, !options.segmentLabels, options.scale)
    }
  } catch (err) {
    console.error(err)
  }

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
  // Don't need options, but this is keeping function signature the same
  // as `calculateImageHeight`
  options: StreetImageOptions
): number {
  const streetData = street.data.street
  const streetWidth = TILE_SIZE * streetData.width // translate width to pixels
  const buildingWidth = BUILDING_SPACE * 2 // multiply for 2 buildings
  const baseWidth = streetWidth + buildingWidth // total width is street + buildings
  return baseWidth
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

  return height
}
