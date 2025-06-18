// import { TILE_SIZE, BUILDING_SPACE } from '../../../client/src/segments/constants.js'
// import { getBuildingImageHeight } from '../../../client/src/segments/buildings.js'
import path from 'node:path'
import url from 'node:url'
import * as Canvas from '@napi-rs/canvas'

import { TILE_SIZE } from './constants.js'
import { drawGround } from './ground.js'
import { drawElementLabelBackground, drawElementLabels } from './labels.js'
import { drawNameplate } from './nameplate.js'
import { drawSky } from './sky.js'
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

// Rubik (and many others) don't actually have the 1/8 vulgar fractions and
// foot-grave marker, so we use this one for now and see how we like it.
Canvas.GlobalFonts.registerFromPath(
  path.join(
    __dirname,
    '../../../node_modules/@fontsource/geist-sans/files/geist-sans-latin-400-normal.woff2'
  ),
  'Geist Sans'
)
Canvas.GlobalFonts.registerFromPath(
  path.join(
    __dirname,
    '../../../node_modules/@fontsource/geist-sans/files/geist-sans-latin-600-normal.woff2'
  ),
  'Geist Sans'
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
  //   elementLabels,
  //   streetName,
  //   watermark
  // })

  // Calculations

  // Determine how wide the street is
  let occupiedWidth = 0
  for (const element of street.data.street.segments) {
    occupiedWidth += element.width
  }

  // TODO: adjust scale for these numbers early?
  // See drawSky for an example where scaled values are passed in to draw function

  // Align things to bottom edge of image
  let offsetTop = baseHeight - 180
  if (options.elementLabels) {
    offsetTop -= IMAGE_NAMES_WIDTHS_PADDING
  }

  const offsetLeft = (baseWidth - occupiedWidth * TILE_SIZE) / 2
  // const buildingOffsetLeft = (baseWidth - street.data.street.width * TILE_SIZE) / 2

  const groundLevel = offsetTop + 135
  const horizonLine = groundLevel + 20

  try {
    // Sky
    if (!options.transparentSky) {
      await drawSky(
        ctx,
        street,
        width,
        height,
        horizonLine * options.scale,
        groundLevel * options.scale,
        options.scale
      )
    }

    // Ground
    drawGround(
      ctx,
      street.data.street,
      baseWidth,
      horizonLine,
      groundLevel,
      options.scale
    )

    // Section element labels
    if (options.elementLabels) {
      drawElementLabelBackground(
        ctx,
        baseWidth,
        baseHeight,
        groundLevel,
        options.scale
      )
      drawElementLabels(ctx, street, groundLevel, offsetLeft, options.scale)
    }

    // Street nameplate
    if (options.streetName) {
      drawNameplate(ctx, street, baseWidth, options.scale)
    }

    // Watermark
    if (options.watermark) {
      // Watermark is inverted (white) if segment labels are shown
      await drawWatermark(
        ctx,
        options.locale,
        !options.elementLabels,
        options.scale
      )
    }
  } catch (err) {
    console.error(err)
  }

  // Test rendering an SVG
  try {
    // Resolve path to illustration package
    const file = import.meta
      .resolve('@streetmix/illustrations/images/construction/cone.svg')
      .replace('file://', '')
    const image = await Canvas.loadImage(file)

    // Set the width and height here to scale properly
    image.width = image.naturalWidth * options.scale
    image.height = image.naturalHeight * options.scale

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
  const { streetName, elementLabels } = options

  // TODO: we can't do a real calc yet because we don't have access to assets
  // Replace with getBoundaryImageHeight
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

  if (elementLabels) {
    height += IMAGE_NAMES_WIDTHS_PADDING
  }

  return height
}
