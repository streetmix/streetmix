import { drawLine } from '@streetmix/export-image/src/labels'

import { images } from '../app/load_resources'
import { prettifyWidth } from '../util/width_units'
import { getSkyboxDef, makeCanvasGradientStopArray } from '../sky'
import { getBoundaryItem, drawBoundary } from '../boundary'
import { GROUND_BASELINE_HEIGHT, TILE_SIZE } from '../segments/constants'
import { getSegmentInfo, getSegmentVariantInfo } from '../segments/info'
import { calculateSlope } from '../segments/slope'
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
  StreetState
} from '@streetmix/types'

const BOTTOM_BACKGROUND = 'rgb(216, 211, 203)'
const BACKGROUND_EARTH_COLOUR = 'rgb(53, 45, 39)'
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
function drawSky (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  street: StreetState, // street data
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
function drawGround (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  street: StreetState, // street data
  width: number, // width of area to draw
  dpi: number, // pixel density of canvas
  multiplier: number, // scale factor of image
  horizonLine: number, // vertical height of horizon
  groundLevel: number // vertical height of ground
) {
  ctx.fillStyle = BACKGROUND_EARTH_COLOUR
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
function drawBoundaries (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  street: StreetState, // street data
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
function drawSegments (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  street: StreetState, // street data
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

    for (let i = 0; i < street.segments.length; i++) {
      const segment = street.segments[i]
      const segmentInfo = getSegmentInfo(segment.type)

      if (segmentInfo.zIndex === zIndex) {
        const variantInfo = getSegmentVariantInfo(
          segment.type,
          segment.variantString
        )
        const dimensions = getVariantInfoDimensions(variantInfo, segment.width)
        const randSeed = segment.id

        // Slope
        const slopeData = calculateSlope(street, i)
        const elevationChange = {
          left: segment.elevation,
          right: segment.elevation
        }
        if (segment.slope && slopeData !== null) {
          elevationChange.left = slopeData.leftElevation
          elevationChange.right = slopeData.rightElevation
        }

        drawSegmentContents(
          ctx,
          segment.type,
          segment.variantString,
          segment.width,
          currentOffsetLeft + dimensions.left * TILE_SIZE * multiplier,
          groundLevel,
          segment.elevation,
          elevationChange,
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
function drawSegmentNamesBackground (
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
 */
function drawSegmentNamesAndWidths (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  street: StreetState,
  dpi: number, // pixel density of canvas
  multiplier: number, // scale factor of image
  groundLevel: number, // vertical height of ground
  offsetLeft: number, // left position to start from
  locale: string // locale to render labels in
): void {
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
function drawSilhouette (
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

/**
 * Draws street nameplate
 */
function drawStreetNameplate (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  street: StreetState, // street data
  width: number, // width of area to draw
  dpi: number // pixel density of canvas
): void {
  let text = street.name || formatMessage('street.default-name', 'Unnamed St')

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '-.025em'
  ctx.font = `normal ${STREET_NAME_FONT_WEIGHT} ${
    STREET_NAME_FONT_SIZE * dpi
  }px ${STREET_NAME_FONT},sans-serif`

  // Handles long names
  let measurement = ctx.measureText(text)

  let needToBeElided = false
  while (measurement.width > (width - 200) * dpi) {
    text = text.substring(0, text.length - 1)
    measurement = ctx.measureText(text)
    needToBeElided = true
  }
  if (needToBeElided) {
    // Append ellipsis, then re-measure the text
    text += '…'
    measurement = ctx.measureText(text)
  }

  // Street nameplate
  ctx.fillStyle = 'white'
  const x1 = (width * dpi) / 2 - (measurement.width / 2 + 45 * dpi)
  const x2 = (width * dpi) / 2 + (measurement.width / 2 + 45 * dpi)
  const y1 = (75 - 60) * dpi
  const y2 = (75 + 60) * dpi
  ctx.fillRect(x1, y1, x2 - x1, y2 - y1)

  // Street nameplate border
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 5 * dpi
  ctx.strokeRect(
    x1 + 5 * dpi * 2,
    y1 + 5 * dpi * 2,
    x2 - x1 - 5 * dpi * 4,
    y2 - y1 - 5 * dpi * 4
  )

  const x = (width * dpi) / 2

  const baselineCorrection = 12
  const y = (75 + baselineCorrection) * dpi

  ctx.strokeStyle = 'transparent'
  ctx.fillStyle = 'black'
  ctx.fillText(text, x, y)
}

/**
 * Draws a "made with Streetmix" watermark on the lower right of the image.
 */
function drawWatermark (
  ctx: CanvasRenderingContext2D, // the canvas context to draw on
  dpi: number, // pixel density of canvas
  invert = false // if `true`, render light text for dark background
): void {
  const text = formatMessage(
    'export.watermark',
    'Made with {streetmixWordmark}',
    {
      // Replace the {placeholder} with itself. Later, this is used to
      // render the logo image in place of the text.
      streetmixWordmark: '{streetmixWordmark}'
    }
  )
  const wordmarkImage = invert
    ? images.get('/images/wordmark_white.svg')
    : images.get('/images/wordmark_black.svg')

  // Separate string so that we can render a wordmark with an image
  const strings = text.replace(/{/g, '||{').replace(/}/g, '}||').split('||')

  // Set text render options
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `normal ${WATERMARK_FONT_WEIGHT} ${
    WATERMARK_FONT_SIZE * dpi
  }px ${WATERMARK_FONT},sans-serif`
  ctx.fillStyle = invert ? WATERMARK_LIGHT_COLOR : WATERMARK_DARK_COLOR

  // Set starting X/Y positions so that watermark is aligned right and bottom of image
  const startRightX = ctx.canvas.width - WATERMARK_RIGHT_MARGIN * dpi
  const startBottomY = ctx.canvas.height - WATERMARK_BOTTOM_MARGIN * dpi

  // Set wordmark width and height based on image scale (dpi)
  const logoWidth = wordmarkImage.width * dpi
  const logoHeight = wordmarkImage.height * dpi

  // Keep track of where we are on the X-position.
  let currentRightX = startRightX

  // Render each part of the string.
  for (let i = strings.length - 1; i >= 0; i--) {
    const string = strings[i]

    // If we see the wordmark placeholder, render the image.
    if (string === '{streetmixWordmark}') {
      const margin = WORDMARK_MARGIN * dpi
      const logoLeftX = currentRightX - logoWidth - margin
      const logoTopY = startBottomY - logoHeight + dpi // Additional adjustment for visual alignment

      ctx.drawImage(
        wordmarkImage.img,
        logoLeftX,
        logoTopY,
        logoWidth,
        logoHeight
      )

      // Update X position.
      currentRightX = logoLeftX - margin
    } else {
      ctx.fillText(string, currentRightX, startBottomY)

      // Update X position.
      currentRightX = currentRightX - ctx.measureText(string).width
    }
  }
}

interface ThumbnailOptions {
  width: number
  height: number
  dpi: number
  multiplier: number
  silhouette: boolean
  transparentSky: boolean
  segmentNamesAndWidths: boolean
  streetName: boolean
  watermark: boolean
  locale: string
}

/**
 * Draws street image to 2D canvas element.
 */
export function drawStreetThumbnail (
  ctx: CanvasRenderingContext2D, // 2D canvas context to draw on
  street: StreetState, // Street data
  {
    width, // Width of resulting image
    height, // Height of resulting image
    dpi, // Pixel density of canvas
    multiplier, // Scale factor of image
    silhouette,
    transparentSky, // If `true`, image is a silhouette
    segmentNamesAndWidths, // If `true`, include segment names and widths
    streetName, // If `true`, include street nameplate
    watermark = true, // If `true`, include Streetmix watermark
    locale = 'en'
  }: ThumbnailOptions
): void {
  // Calculations

  // Determine how wide the street is
  let occupiedWidth = 0
  for (const segment of street.segments) {
    occupiedWidth += segment.width
  }

  // Align things to bottom edge of image
  let offsetTop = height - 180 * multiplier
  if (segmentNamesAndWidths) {
    offsetTop -= SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING * multiplier
  }

  const offsetLeft = (width - occupiedWidth * TILE_SIZE * multiplier) / 2
  const buildingOffsetLeft = (width - street.width * TILE_SIZE * multiplier) / 2

  const groundLevel = offsetTop + 135 * multiplier
  const horizonLine = groundLevel + 20 * multiplier

  // Sky
  if (!transparentSky) {
    drawSky(
      ctx,
      street,
      width,
      height,
      dpi,
      multiplier,
      horizonLine,
      groundLevel
    )
  }

  // Ground
  drawGround(ctx, street, width, dpi, multiplier, horizonLine, groundLevel)

  // Buildings
  drawBoundaries(
    ctx,
    street,
    width,
    dpi,
    multiplier,
    groundLevel,
    buildingOffsetLeft
  )

  // Segments
  drawSegments(ctx, street, dpi, multiplier, groundLevel, offsetLeft)

  // Segment names background
  if (segmentNamesAndWidths || silhouette) {
    drawSegmentNamesBackground(ctx, width, height, dpi, multiplier, groundLevel)
  }

  // Segment names
  if (segmentNamesAndWidths) {
    drawSegmentNamesAndWidths(
      ctx,
      street,
      dpi,
      multiplier,
      groundLevel,
      offsetLeft,
      locale
    )
  }

  // Silhouette
  if (silhouette) {
    drawSilhouette(ctx, width, height, dpi)
  }

  // Street nameplate
  if (streetName) {
    drawStreetNameplate(ctx, street, width, dpi)
  }

  // Watermark
  if (watermark) {
    drawWatermark(ctx, dpi, !segmentNamesAndWidths)
  }
}
