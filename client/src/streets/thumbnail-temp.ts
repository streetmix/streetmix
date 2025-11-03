/**
 * temporary file where the typescript porting happens
 */
import { drawLine } from '@streetmix/export-image/src/labels'

import { images } from '../app/load_resources'
import { prettifyWidth } from '../util/width_units'
import { getSkyboxDef, makeCanvasGradientStopArray } from '../sky'
import { getBoundaryItem, drawBoundary } from '../boundary'
import { getSegmentInfo, getSegmentVariantInfo } from '../segments/info'
import { GROUND_BASELINE_HEIGHT, TILE_SIZE } from '../segments/constants'
import {
  getVariantInfoDimensions,
  drawSegmentContents,
  getLocaleSegmentName
} from '../segments/view'
import { formatMessage } from '../locales/locale'
import { SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING } from './image'

import type {
  CSSGradientDeclaration,
  SkyboxDefWithStyles,
  SkyboxObject,
  StreetJson
} from '@streetmix/types'

const BOTTOM_BACKGROUND = 'rgb(216, 211, 203)'
const BACKGROUND_DIRT_COLOUR = 'rgb(53, 45, 39)'
const SILHOUETTE_FILL_COLOUR = 'rgb(240, 240, 240)'

const SEGMENT_NAME_FONT = 'Rubik Variable'
const SEGMENT_NAME_FONT_SIZE = 12
const SEGMENT_NAME_FONT_WEIGHT = '400'

const STREET_NAME_FONT = 'Overpass Variable'
const STREET_NAME_FONT_SIZE = 70
const STREET_NAME_FONT_WEIGHT = '700'

const WATERMARK_FONT = 'Rubik Variable'
const WATERMARK_FONT_SIZE = 24
const WATERMARK_FONT_WEIGHT = '600'
const WATERMARK_RIGHT_MARGIN = 15
const WATERMARK_BOTTOM_MARGIN = 15
const WATERMARK_DARK_COLOR = '#333333'
const WATERMARK_LIGHT_COLOR = '#cccccc'

const WORDMARK_MARGIN = 4

/**
 * Draws sky.
 */
export function drawSky (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  street: StreetJson, // street data
  width: number, // width of area to draw
  height: number, // height of area to draw
  dpi: number, // pixel density of canvas
  multiplier: number, // scale factor of image
  horizonLine: number, // lower edge of sky area (vertical height of horizon)
  groundLevel: number // ground elevation line (vertical height of ground)
) {
  const sky = getSkyboxDef(street.skybox)

  // Solid color fill
  if (sky.backgroundColor !== undefined) {
    drawBackgroundColor(
      ctx,
      width * dpi,
      horizonLine * dpi,
      sky.backgroundColor
    )
  }

  // Background image fill
  if (sky.backgroundImage) {
    drawBackgroundImage(
      ctx,
      width,
      height,
      dpi,
      multiplier,
      sky.backgroundImage
    )
  }

  // Gradient fill
  if (sky.backgroundGradient) {
    drawBackgroundGradient(ctx, width, horizonLine, dpi, sky.backgroundGradient)
  }

  // Background objects
  if (sky.backgroundObjects) {
    drawBackgroundObjects(
      ctx,
      width,
      height,
      dpi,
      multiplier,
      sky.backgroundObjects
    )
  }

  // Clouds
  drawClouds(ctx, width, groundLevel, dpi, sky)
}

/**
 * Draws a layer of background color
 */
function drawBackgroundColor (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  width: number, // width of area to draw (scaled)
  height: number, // height of area to draw (scaled)
  color: string // color to render
): void {
  ctx.save()
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

/**
 * Draws background image as a repeating pattern.
 */
function drawBackgroundImage (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  width: number, // width of area to draw
  height: number, // height of area to draw
  dpi: number, // pixel density of canvas
  multiplier: number, // scale factor of image
  imageId: unknown // image ID to render
): void {
  const img = images.get(imageId)

  for (let i = 0; i < Math.floor((height / img.height) * multiplier) + 1; i++) {
    for (let j = 0; j < Math.floor((width / img.width) * multiplier) + 1; j++) {
      ctx.drawImage(
        img.img,
        0,
        0,
        img.width,
        img.height,
        j * img.width * dpi * multiplier,
        i * img.height * dpi * multiplier,
        img.width * dpi * multiplier,
        img.height * dpi * multiplier
      )
    }
  }
}

/**
 * Draws background linear gradient.
 */
function drawBackgroundGradient (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  width: number, // width of area to draw
  height: number, // height of area to draw
  dpi: number, // pixel density of canvas
  backgroundGradient: CSSGradientDeclaration // skybox definition of gradient
): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height * dpi)

  // Make color stops
  const stops = makeCanvasGradientStopArray(backgroundGradient)
  for (let i = 0; i < stops.length; i++) {
    const [color, stop] = stops[i]
    gradient.addColorStop(stop, color)
  }

  ctx.save()
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width * dpi, height * dpi)
  ctx.restore()
}

/**
 * Draws background linear gradient.
 */
function drawBackgroundObjects (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  width: number, // width of area to draw
  height: number, // height of area to draw
  dpi: number, // pixel density of canvas
  multiplier: number, // scale factor of image
  objects: SkyboxObject[] // skybox definition of background objects
): void {
  objects.forEach((object) => {
    const {
      image: imageId,
      width: imageWidth,
      height: imageHeight,
      top,
      left
    } = object
    const image = images.get(imageId).img
    ctx.drawImage(
      image,
      // Left and top values are "percentage" values
      // and sets where the center of the image is
      (left * width - imageWidth / 2) * dpi * multiplier,
      (top * height - imageHeight / 2) * dpi * multiplier,
      imageWidth * dpi * multiplier,
      imageHeight * dpi * multiplier
    )
  })
}

/**
 * Draws clouds.
 */
function drawClouds (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  width: number, // width of area to draw
  height: number, // height of area to draw
  dpi: number, // pixel density of canvas
  sky: SkyboxDefWithStyles // skybox settings
): void {
  // Handle cloud opacity
  ctx.save()
  ctx.globalAlpha = sky.cloudOpacity ?? 1

  // Grab images
  const skyFrontImg = images.get('/images/sky-front.svg')
  const skyRearImg = images.get('/images/sky-rear.svg')

  // Source images are 2x what they need to be for the math to work
  // so until we resize the intrinsic size of the images, we have to
  // do this and then size it back up later
  const skyFrontWidth = skyFrontImg.width / 2
  const skyFrontHeight = skyFrontImg.height / 2
  const skyRearWidth = skyRearImg.width / 2
  const skyRearHeight = skyRearImg.height / 2

  // TODO document magic numbers
  // y1 = top edge of sky-front image
  const y1 = height - skyFrontHeight

  for (let i = 0; i < Math.floor(width / skyFrontWidth) + 1; i++) {
    ctx.drawImage(
      skyFrontImg.img,
      0,
      0,
      skyFrontWidth * 2,
      skyFrontHeight * 2, // todo: change intrinsic size
      i * skyFrontWidth * dpi,
      y1 * dpi,
      skyFrontWidth * dpi,
      skyFrontHeight * dpi
    )
  }

  // TODO document magic numbers
  // y2 = top edge of sky-rear is 120 pixels above the top edge of sky-front
  const y2 = height - skyFrontHeight - 120

  for (let i = 0; i < Math.floor(width / skyRearWidth) + 1; i++) {
    ctx.drawImage(
      skyRearImg.img,
      0,
      0,
      skyRearWidth * 2,
      skyRearHeight * 2, // todo: change intrinsic size
      i * skyRearWidth * dpi,
      y2 * dpi,
      skyRearWidth * dpi,
      skyRearHeight * dpi
    )
  }

  // Restore global opacity
  ctx.restore()
}

/**
 * Draws ground.
 */
export function drawGround (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  street: StreetJson, // street data
  width: number, // width of area to draw
  dpi: number, // pixel density of canvas
  multiplier: number, // scale factor of image
  horizonLine: number, // vertical height of horizon
  groundLevel: number // vertical height of ground
) {
  ctx.fillStyle = BACKGROUND_DIRT_COLOUR
  ctx.fillRect(0, horizonLine * dpi, width * dpi, 25 * multiplier * dpi)

  // Get elevation at boundaries if they are set to something
  // The `boundary` property does not exist prior to schema version 31,
  // and gallery will still need to render data that doesn't have it.
  // There are intermediary schemas where the boundary property did
  // not use real units (they were using 0 or 1) but these don't exist
  // in the wild, so don't bother handling this case
  let leftElevation = 0
  let rightElevation = 0
  if (street.boundary?.left.elevation > 0) {
    leftElevation = street.boundary.left.elevation * TILE_SIZE
  }
  if (street.boundary?.right.elevation > 0) {
    rightElevation = street.boundary.right.elevation * TILE_SIZE
  }

  // Left boundary
  ctx.fillRect(
    0,
    (groundLevel - leftElevation * multiplier) * dpi,
    (width / 2 - (street.width * TILE_SIZE * multiplier) / 2) * dpi,
    (20 + leftElevation) * multiplier * dpi
  )

  // RightElevation
  ctx.fillRect(
    (width / 2 + (street.width * TILE_SIZE * multiplier) / 2) * dpi,
    (groundLevel - rightElevation * multiplier) * dpi,
    width * dpi,
    (20 + rightElevation) * multiplier * dpi
  )
}

/**
 * Draws buildings.
 */
export function drawBoundaries (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  street: StreetJson, // street data
  width: number, // width of area to draw
  dpi: number, // pixel density of canvas
  multiplier: number, // scale factor of image
  groundLevel: number, // vertical height of ground
  buildingOffsetLeft: number
): void {
  const buildingWidth = buildingOffsetLeft / multiplier

  // Left building
  const x1 = width / 2 - (street.width * TILE_SIZE * multiplier) / 2
  // Keep deprecated properties here because gallery streets are transmitted
  // without updating schemas
  const leftVariant =
    street.boundary?.left.variant ?? street.leftBuildingVariant
  const leftElevation = street.boundary?.left.elevation ?? 1
  const leftFloors = street.boundary?.left.floors ?? street.leftBuildingHeight
  const leftBuilding = getBoundaryItem(leftVariant)
  const leftOverhang =
    typeof leftBuilding.overhangWidth === 'number'
      ? leftBuilding.overhangWidth
      : 0
  drawBoundary(
    ctx,
    'left',
    leftVariant,
    leftElevation,
    leftFloors,
    buildingWidth,
    groundLevel,
    x1 - (buildingWidth - leftOverhang) * multiplier,
    multiplier,
    dpi
  )

  // Right building
  const x2 = width / 2 + (street.width * TILE_SIZE * multiplier) / 2
  // Keep deprecated properties here because gallery streets are transmitted
  // without updating schemas
  const rightVariant =
    street.boundary?.right.variant ?? street.rightBuildingVariant
  const rightElevation = street.boundary?.right.elevation ?? 1
  const rightFloors =
    street.boundary?.right.floors ?? street.rightBuildingHeight
  const rightBuilding = getBoundaryItem(rightVariant)
  const rightOverhang =
    typeof rightBuilding.overhangWidth === 'number'
      ? rightBuilding.overhangWidth
      : 0
  drawBoundary(
    ctx,
    'right',
    rightVariant,
    rightElevation,
    rightFloors,
    buildingWidth,
    groundLevel,
    x2 - rightOverhang * multiplier,
    multiplier,
    dpi
  )
}

/**
 * Draws segments.
 */
export function drawSegments (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  street: StreetJson, // street data
  dpi: number, // pixel density of canvas
  multiplier: number, // scale factor of image
  groundLevel: number, // vertical height of ground
  offsetLeft: number // left position to start from
): void {
  // Collect z-indexes
  const zIndexes = []
  for (const segment of street.segments) {
    const segmentInfo = getSegmentInfo(segment.type)

    if (zIndexes.indexOf(segmentInfo.zIndex) === -1) {
      zIndexes.push(segmentInfo.zIndex)
    }
  }

  // Render objects at each z-index level
  for (const zIndex of zIndexes) {
    let currentOffsetLeft = offsetLeft

    for (const segment of street.segments) {
      const segmentInfo = getSegmentInfo(segment.type)

      if (segmentInfo.zIndex === zIndex) {
        const variantInfo = getSegmentVariantInfo(
          segment.type,
          segment.variantString
        )
        const dimensions = getVariantInfoDimensions(variantInfo, segment.width)
        const randSeed = segment.id

        drawSegmentContents(
          ctx,
          segment.type,
          segment.variantString,
          segment.width,
          currentOffsetLeft + dimensions.left * TILE_SIZE * multiplier,
          groundLevel,
          segment.elevation,
          segment.slope,
          randSeed,
          multiplier,
          dpi
        )
      }

      currentOffsetLeft += segment.width * TILE_SIZE * multiplier
    }
  }
}

/**
 * Draws the segment names background.
 */
export function drawSegmentNamesBackground (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  width: number, // width of area to draw
  height: number, // height of area to draw
  dpi: number, // pixel density of canvas
  multiplier: number, // scale factor of image
  groundLevel: number // vertical height of ground
): void {
  ctx.fillStyle = BOTTOM_BACKGROUND
  ctx.fillRect(
    0,
    (groundLevel + GROUND_BASELINE_HEIGHT * multiplier) * dpi,
    width * dpi,
    (height - groundLevel - GROUND_BASELINE_HEIGHT * multiplier) * dpi
  )
}

/**
 * Draws segment names and widths.
 *
 * @param {CanvasRenderingContext2D} ctx -
 * @param {Number} dpi -
 * @param {Number} multiplier -
 * @param {Number} groundLevel -
 * @param {Number} offsetLeft -
 * @param {Number} locale -
 * @modifies {CanvasRenderingContext2D} ctx
 */
export function drawSegmentNamesAndWidths (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  street: StreetJson,
  dpi: number, // pixel density of canvas
  multiplier: number, // scale factor of image
  groundLevel: number, // vertical height of ground
  offsetLeft: number, // left position to start from
  locale: string // locale to render labels in
) {
  ctx.save()

  ctx.strokeStyle = 'black'
  ctx.lineWidth = 0.25 * dpi
  ctx.font = `normal ${SEGMENT_NAME_FONT_WEIGHT} ${
    SEGMENT_NAME_FONT_SIZE * dpi
  }px ${SEGMENT_NAME_FONT},sans-serif`
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  street.segments.forEach((element, i) => {
    const availableWidth = element.width * TILE_SIZE * multiplier

    let left = offsetLeft

    if (i === 0) {
      left--
    }

    // Left line
    drawLine(
      ctx,
      left,
      groundLevel + GROUND_BASELINE_HEIGHT * multiplier,
      left,
      groundLevel + 125 * multiplier,
      dpi
    )

    const x = (offsetLeft + availableWidth / 2) * dpi

    // Width label
    const text = prettifyWidth(element.width, street.units, locale)
    ctx.fillText(text, x, (groundLevel + 60 * multiplier) * dpi)

    // Segment name label
    const name =
      element.label ?? getLocaleSegmentName(element.type, element.variantString)
    const nameWidth = ctx.measureText(name).width / dpi

    if (nameWidth <= availableWidth - 10 * multiplier) {
      ctx.fillText(name, x, (groundLevel + 83 * multiplier) * dpi)
    }

    offsetLeft += availableWidth
  })

  // Final right-hand side line
  const left = offsetLeft + 1
  drawLine(
    ctx,
    left,
    groundLevel + GROUND_BASELINE_HEIGHT * multiplier,
    left,
    groundLevel + 125 * multiplier,
    dpi
  )

  ctx.restore()
}

/**
 * Turns drawn objects on canvas into a single-colour silhouette
 */
export function drawSilhouette (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  width: number, // width of area to draw
  height: number, // height of area to draw
  dpi: number // pixel density of canvas
): void {
  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  ctx.fillStyle = SILHOUETTE_FILL_COLOUR
  ctx.fillRect(0, 0, width * dpi, height * dpi)
  ctx.restore()
}
