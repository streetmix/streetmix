import { images } from '../app/load_resources'
import { TILE_SIZE } from '../segments/constants'
import { formatMessage } from '../locales/locale'
import { SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING } from './image'
import {
  drawBoundaries,
  drawGround,
  drawSegmentNamesAndWidths,
  drawSegmentNamesBackground,
  drawSegments,
  drawSilhouette,
  drawSky
} from './thumbnail-temp'

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
 * Draws street nameplate
 *
 * @param {CanvasRenderingContext2D} ctx - the canvas context to draw on
 * @param {Object} street - street data
 * @param {Number} width - width of area to draw
 * @param {Number} dpi - pixel density of canvas
 * @modifies {CanvasRenderingContext2D} ctx
 */
function drawStreetNameplate (ctx, street, width, dpi) {
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
 *
 * @todo Make it work with rtl
 * @param {CanvasRenderingContext2D} ctx - the canvas context to draw on.
 * @param {Number} dpi - pixel density of canvas
 * @param {Boolean} invert - if `true`, render light text for dark background
 * @modifies {CanvasRenderingContext2D}
 */
function drawWatermark (ctx, dpi, invert = false) {
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

/**
 * Draws street image to 2D canvas element.
 *
 * @param {CanvasRenderingContext2D} ctx - 2D canvas context to draw on
 * @param {Object} street - Street data
 * @param {Object} params
 * @param {Number} params.width - Width of resulting image
 * @param {Number} params.height - Height of resulting image
 * @param {Number} params.dpi - Pixel density of canvas
 * @param {Number} params.multiplier - Scale factor of image
 * @param {Boolean} params.silhouette - If `true`, image is a silhouette
 * @param {Boolean} params.transparentSky - If `true`, sky is transparent
 * @param {Boolean} params.segmentNamesAndWidths - If `true`, include segment names and widths
 * @param {Boolean} params.streetName - If `true`, include street nameplate
 * @param {Boolean} params.watermark - If `true`, include Streetmix watermark
 * @modifies {CanvasRenderingContext2D} ctx
 */
export function drawStreetThumbnail (
  ctx,
  street,
  {
    width,
    height,
    dpi,
    multiplier,
    silhouette,
    transparentSky,
    segmentNamesAndWidths,
    streetName,
    watermark = true,
    locale = 'en'
  }
) {
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
