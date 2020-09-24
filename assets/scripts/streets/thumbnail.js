import { images } from '../app/load_resources'
import { drawLine } from '../util/canvas_drawing'
import { prettifyWidth } from '../util/width_units'
import { SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING } from './image'
import { getEnvirons, makeCanvasGradientStopArray } from '../streets/environs'
import {
  BUILDINGS,
  GROUND_BASELINE_HEIGHT,
  drawBuilding
} from '../segments/buildings'
import { getSegmentInfo, getSegmentVariantInfo } from '../segments/info'
import { TILE_SIZE } from '../segments/constants'
import {
  getVariantInfoDimensions,
  drawSegmentContents,
  getLocaleSegmentName
} from '../segments/view'
import { formatMessage } from '../locales/locale'

const BOTTOM_BACKGROUND = 'rgb(216, 211, 203)'
const BACKGROUND_DIRT_COLOUR = 'rgb(53, 45, 39)'

const WATERMARK_TEXT_SIZE = 24
const WATERMARK_RIGHT_MARGIN = 15
const WATERMARK_BOTTOM_MARGIN = 15
const WATERMARK_DARK_COLOR = '#333333'
const WATERMARK_LIGHT_COLOR = '#cccccc'

const WORDMARK_MARGIN = 4

/**
 * Draws a "made with Streetmix" watermark on the lower right of the image.
 *
 * @todo Make it work with rtl
 * @param {CanvasRenderingContext2D} ctx - the canvas context to draw on.
 * @param {Number} dpi - scale factor of image.
 * @param {Boolean} invert - if `true`, render light text for dark background
 * @modifies {CanvasRenderingContext2D}
 */
function drawWatermark (ctx, dpi, invert) {
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
  ctx.font = `normal 600 ${WATERMARK_TEXT_SIZE * dpi}px Rubik,sans-serif`
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
 * Draws a layer of background color
 *
 * @param {CanvasRenderingContext2D} ctx - the canvas context to draw on
 * @param {Number} dpi - scale factor of image
 * @param {Number} width - width of area to draw
 * @param {Number} height - height of area to draw
 * @param {string} color - color to render
 * @modifies {CanvasRenderingContext2D} ctx
 */
function drawBackgroundColor (ctx, dpi, width, height, color) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width * dpi, height * dpi)
}

/**
 * Draws background image as a repeating pattern.
 *
 * @param {CanvasRenderingContext2D} ctx - the canvas context to draw on
 * @param {Number} dpi - scale factor of image
 * @param {Number} width - width of area to draw
 * @param {Number} height - height of area to draw
 * @param {Object} imageId - image ID to render
 * @modifies {CanvasRenderingContext2D} ctx
 */
function drawBackgroundImage (ctx, dpi, width, height, imageId) {
  const img = images.get(imageId)

  for (let i = 0; i < Math.floor(height / img.height) + 1; i++) {
    for (let j = 0; j < Math.floor(width / img.width) + 1; j++) {
      ctx.drawImage(
        img.img,
        0,
        0,
        img.width,
        img.height,
        j * img.width * dpi,
        i * img.height * dpi,
        img.width * dpi,
        img.height * dpi
      )
    }
  }
}

/**
 * Draws background linear gradient.
 *
 * @param {CanvasRenderingContext2D} ctx - the canvas context to draw on
 * @param {Number} dpi - scale factor of image
 * @param {Number} width - width of area to draw
 * @param {Number} height - height of area to draw
 * @param {Array} backgroundGradient - environs definition of gradient
 * @modifies {CanvasRenderingContext2D} ctx
 */
function drawBackgroundGradient (ctx, dpi, width, height, backgroundGradient) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height * dpi)

  // Make color stops
  const stops = makeCanvasGradientStopArray(backgroundGradient)
  for (let i = 0; i < stops.length; i++) {
    const [color, stop] = stops[i]
    gradient.addColorStop(stop, color)
  }

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width * dpi, height * dpi)
}

/**
 * Draws background linear gradient.
 *
 * @param {CanvasRenderingContext2D} ctx - the canvas context to draw on
 * @param {Number} dpi - scale factor of image
 * @param {Number} width - width of area to draw
 * @param {Number} height - height of area to draw
 * @param {Array} objects - environs definition of background objects
 * @modifies {CanvasRenderingContext2D} ctx
 */
function drawBackgroundObjects (ctx, dpi, width, height, objects) {
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
      (left * width - imageWidth / 2) * dpi,
      (top * height - imageHeight / 2) * dpi,
      imageWidth * dpi,
      imageHeight * dpi
    )
  })
}

/**
 * Draws clouds.
 *
 * @param {CanvasRenderingContext2D} ctx - the canvas context to draw o
 * @param {Number} dpi - scale factor of image
 * @param {Number} width - width of area to draw
 * @param {Number} height - height of area to draw
 * @param {Object} env - environs settings
 * @modifies {CanvasRenderingContext2D} ctx
 */
function drawClouds (ctx, dpi, width, height, env) {
  // Handle cloud opacity
  ctx.save()
  ctx.globalAlpha = env.cloudOpacity || 1

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

export function drawStreetThumbnail (
  ctx,
  street,
  thumbnailWidth,
  thumbnailHeight,
  dpi,
  multiplier,
  silhouette,
  bottomAligned,
  transparentSky,
  segmentNamesAndWidths,
  streetName,
  watermark = true
) {
  // Calculations

  // Determine how wide the street is
  let occupiedWidth = 0
  for (const segment of street.segments) {
    occupiedWidth += segment.width
  }

  var offsetTop
  if (bottomAligned) {
    offsetTop = thumbnailHeight - 180 * multiplier
  } else {
    offsetTop = (thumbnailHeight + 5 * TILE_SIZE * multiplier) / 2
  }
  if (segmentNamesAndWidths) {
    offsetTop -= SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING * multiplier
  }

  var offsetLeft = (thumbnailWidth - occupiedWidth * TILE_SIZE * multiplier) / 2
  var buildingOffsetLeft =
    (thumbnailWidth - street.width * TILE_SIZE * multiplier) / 2

  const groundLevel = offsetTop + 135 * multiplier
  const horizonLine = groundLevel + 20 * multiplier

  // Sky
  if (!transparentSky) {
    const env = getEnvirons(street.environment)

    // Solid color fill
    if (env.backgroundColor) {
      drawBackgroundColor(
        ctx,
        dpi,
        thumbnailWidth,
        horizonLine,
        env.backgroundColor
      )
    }

    // Background image fill
    if (env.backgroundImage) {
      drawBackgroundImage(
        ctx,
        dpi,
        thumbnailWidth,
        thumbnailHeight,
        env.backgroundImage
      )
    }

    // Gradient fill
    if (env.backgroundGradient) {
      drawBackgroundGradient(
        ctx,
        dpi,
        thumbnailWidth,
        horizonLine,
        env.backgroundGradient
      )
    }

    // Background objects
    if (env.backgroundObjects) {
      drawBackgroundObjects(
        ctx,
        dpi,
        thumbnailWidth,
        thumbnailHeight,
        env.backgroundObjects
      )
    }

    // Cluds
    drawClouds(ctx, dpi, thumbnailWidth, groundLevel, env)
  }

  // Dirt

  ctx.fillStyle = BACKGROUND_DIRT_COLOUR
  ctx.fillRect(
    0,
    horizonLine * dpi,
    thumbnailWidth * dpi,
    25 * multiplier * dpi
  )

  ctx.fillRect(
    0,
    groundLevel * dpi,
    (thumbnailWidth / 2 - (street.width * TILE_SIZE * multiplier) / 2) * dpi,
    20 * multiplier * dpi
  )

  ctx.fillRect(
    (thumbnailWidth / 2 + (street.width * TILE_SIZE * multiplier) / 2) * dpi,
    groundLevel * dpi,
    thumbnailWidth * dpi,
    20 * multiplier * dpi
  )

  // Buildings

  const buildingWidth = buildingOffsetLeft / multiplier

  // Left building
  const x1 = thumbnailWidth / 2 - (street.width * TILE_SIZE * multiplier) / 2
  const leftBuilding = BUILDINGS[street.leftBuildingVariant]
  const leftOverhang =
    typeof leftBuilding.overhangWidth === 'number'
      ? leftBuilding.overhangWidth
      : 0
  drawBuilding(
    ctx,
    street.leftBuildingVariant,
    street.leftBuildingHeight,
    'left',
    buildingWidth,
    groundLevel,
    x1 - (buildingWidth - leftOverhang) * multiplier,
    multiplier,
    dpi
  )

  // Right building
  const x2 = thumbnailWidth / 2 + (street.width * TILE_SIZE * multiplier) / 2
  const rightBuilding = BUILDINGS[street.rightBuildingVariant]
  const rightOverhang =
    typeof rightBuilding.overhangWidth === 'number'
      ? rightBuilding.overhangWidth
      : 0
  drawBuilding(
    ctx,
    street.rightBuildingVariant,
    street.rightBuildingHeight,
    'right',
    buildingWidth,
    groundLevel,
    x2 - rightOverhang * multiplier,
    multiplier,
    dpi
  )

  // Segments

  var originalOffsetLeft = offsetLeft

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
    let offsetLeft = originalOffsetLeft

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
          offsetLeft + dimensions.left * TILE_SIZE * multiplier,
          groundLevel,
          randSeed,
          multiplier,
          dpi
        )
      }

      offsetLeft += segment.width * TILE_SIZE * multiplier
    }
  }

  // Segment names background
  if (segmentNamesAndWidths || silhouette) {
    ctx.fillStyle = BOTTOM_BACKGROUND
    ctx.fillRect(
      0,
      (groundLevel + GROUND_BASELINE_HEIGHT * multiplier) * dpi,
      thumbnailWidth * dpi,
      (thumbnailHeight - groundLevel - GROUND_BASELINE_HEIGHT * multiplier) *
        dpi
    )
  }

  // Segment names
  if (segmentNamesAndWidths) {
    let offsetLeft = originalOffsetLeft
    ctx.save()

    // TODO const
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 0.25 * dpi
    ctx.font = `normal 400 ${12 * dpi}px Rubik`
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    for (const i in street.segments) {
      const segment = street.segments[i]
      const availableWidth = segment.width * TILE_SIZE * multiplier

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
      let text = prettifyWidth(segment.width, street.units)
      let textWidth = ctx.measureText(text).width / dpi

      while (
        textWidth > availableWidth - 10 * multiplier &&
        text.indexOf(' ') !== -1
      ) {
        text = text.substr(0, text.lastIndexOf(' '))
        textWidth = ctx.measureText(text).width / dpi
      }

      ctx.fillText(text, x, (groundLevel + 60 * multiplier) * dpi)

      // Segment name label
      const name =
        segment.label ||
        getLocaleSegmentName(segment.type, segment.variantString)
      const nameWidth = ctx.measureText(name).width / dpi

      if (nameWidth <= availableWidth - 10 * multiplier) {
        ctx.fillText(name, x, (groundLevel + 83 * multiplier) * dpi)
      }

      offsetLeft += availableWidth
    }

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

  // Silhouette

  if (silhouette) {
    ctx.globalCompositeOperation = 'source-atop'
    // TODO const
    ctx.fillStyle = 'rgb(240, 240, 240)'
    ctx.fillRect(0, 0, thumbnailWidth * dpi, thumbnailHeight * dpi)
  }

  // Street name

  if (streetName) {
    let text = street.name || formatMessage('street.default-name', 'Unnamed St')

    ctx.textAlign = 'center'
    ctx.textBaseline = 'center'
    ctx.font = `normal 700 ${70 * dpi}px interstate-condensed,sans-serif`

    var measurement = ctx.measureText(text)

    var needToBeElided = false
    while (measurement.width > (thumbnailWidth - 200) * dpi) {
      text = text.substr(0, text.length - 1)
      measurement = ctx.measureText(text)
      needToBeElided = true
    }
    if (needToBeElided) {
      text += '…'
    }

    // Street nameplate
    ctx.fillStyle = 'white'
    const x1 = (thumbnailWidth * dpi) / 2 - (measurement.width / 2 + 45 * dpi)
    const x2 = (thumbnailWidth * dpi) / 2 + (measurement.width / 2 + 45 * dpi)
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

    const x = (thumbnailWidth * dpi) / 2

    const baselineCorrection = 27
    const y = (75 + baselineCorrection) * dpi

    ctx.strokeStyle = 'transparent'
    ctx.fillStyle = 'black'
    ctx.fillText(text, x, y)
  }

  // Watermark
  if (watermark) {
    if (segmentNamesAndWidths) {
      drawWatermark(ctx, dpi)
    } else {
      drawWatermark(ctx, dpi, true)
    }
  }
}
