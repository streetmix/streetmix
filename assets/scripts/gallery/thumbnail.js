import { images } from '../app/load_resources'
import { drawLine } from '../util/canvas_drawing'
import { prettifyWidth } from '../util/width_units'
import { SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING } from '../streets/image'
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
import { t } from '../locales/locale'

// TODO: replace SKY_WIDTH with image's natural width
const SKY_WIDTH = 250
const BOTTOM_BACKGROUND = 'rgb(216, 211, 203)'
const BACKGROUND_DIRT_COLOUR = 'rgb(53, 45, 39)'

const WATERMARK_TEXT_SIZE = 24
const WATERMARK_RIGHT_MARGIN = 15
const WATERMARK_BOTTOM_MARGIN = 15
const WATERMARK_DARK_COLOR = '#333333'
const WATERMARK_LIGHT_COLOR = '#cccccc'

// Hardcoded SVG, for now, using the same as logo embedded in CSS.
// We load the source image here immediately so that the thumbnail canvas can draw with it ASAP (for now)
const WORDMARK_IMAGE = new Image()
WORDMARK_IMAGE.src = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDE2MCAyOCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxuczpzZXJpZj0iaHR0cDovL3d3dy5zZXJpZi5jb20vIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEuNDE0MjE7Ij4KICAgIDxnIHRyYW5zZm9ybT0ibWF0cml4KDAuODU3MjM4LDAsMCwwLjg1NzIzOCwtMTQuMTU0NywtMTUuMjc2OCkiPgogICAgICAgIDxwYXRoIGQ9Ik0yOC45NDMsMjAuNjY0QzIyLjU1OCwyMC42NjQgMTguMjMzLDIzLjgxNCAxOC4yMzMsMjguODU0QzE4LjIzMywzOS4zMTIgMzQuMTA4LDM1LjY1OCAzNC4xMDgsNDIuMjExQzM0LjEwOCw0NC40ODEgMzIuMDUxLDQ1Ljc4MSAyOC42MDgsNDUuNzgxQzI1LjQ1OCw0NS43ODEgMjEuNjc4LDQ0LjI3MSAxOC42NTIsNDEuNDk4TDE2LjUxMiw0NS43ODFDMTkuNTM1LDQ4LjU1MyAyMy45MDIsNTAuNDQzIDI4LjUyMiw1MC40NDNDMzQuOTksNTAuNDQzIDM5LjYxLDQ3LjIwOSAzOS42MSw0MS45NkMzOS42NTIsMzEuMzc1IDIzLjc3NywzNC44MTggMjMuNzc3LDI4LjM5M0MyMy43NzcsMjYuNDE5IDI1LjY2NywyNS4zMjYgMjguNTY1LDI1LjMyNkMzMC43OTEsMjUuMzI2IDMzLjk4MywyNi4xMjQgMzcuMTc1LDI4LjA1NkwzOS4yMzMsMjMuNjg5QzM2LjUwMywyMS44ODIgMzIuNzY1LDIwLjY2MyAyOC45NDMsMjAuNjYzTDI4Ljk0MywyMC42NjRaTTU0LjQzNiw0NS4xNUM1My4xMzYsNDUuNzggNTIuMDg0LDQ2LjExNyA1MS4wNzYsNDYuMTE3QzQ5LjU2Niw0Ni4xMTcgNDguNjgzLDQ1LjQwMyA0OC42ODMsNDMuMDkzTDQ4LjY4MywzMi4zODNMNTUuMjc2LDMyLjM4M0w1NS4yNzYsMjguNzdMNDguNjgzLDI4Ljc3TDQ4LjY4MywyMi42NEw0My44OTUsMjIuNjRMNDMuODk1LDI4Ljc3TDQwLjc0NSwyOC43N0w0MC43NDUsMzIuMzgyTDQzLjg5NSwzMi4zODJMNDMuODk1LDQzLjk3NEM0My44OTUsNDguNTUyIDQ2Ljc5Myw1MC40ODQgNTAuMTUzLDUwLjQ4NEM1Mi4wNDMsNTAuNDg0IDUzLjg5MSw0OS44OTcgNTUuNjU1LDQ4Ljg0Nkw1NC40MzUsNDUuMTUxTDU0LjQzNiw0NS4xNVpNNjIuODM2LDI3LjkzTDU4LjAwNiwyNy45M0w1OC4wMDYsNTAuMjc0TDYyLjgzNiw1MC4yNzRMNjIuODM2LDM4LjU5OEM2My4yMTYsMzQuNzc2IDY2LjA3LDMyLjEzMSA3MC41NjQsMzIuMzgyTDcwLjU2NCwyNy43NjJDNjcuMDM3LDI3Ljc2MiA2NC4zNDgsMjkuMzU4IDYyLjgzNiwzMi4zODJMNjIuODM2LDI3LjkzMkw2Mi44MzYsMjcuOTNaTTgxLjY1MiwyNy43NjJDNzUuMDE3LDI3LjgwNCA3MC4zNTUsMzIuMzgyIDcwLjM1NSwzOS4xNDVDNzAuMzU1LDQ1Ljg2NSA3NC44OTEsNTAuNDQyIDgxLjc3OSw1MC40NDJDODUuNjQyLDUwLjQ0MiA4OC44MzQsNDkuMDU3IDkxLjAxNyw0Ni42NjJMODguNDU1LDQzLjkzMkM4Ni44MTcsNDUuNjEyIDg0LjU5MSw0Ni41MzYgODIuMTU1LDQ2LjUzNkM3OC42MjgsNDYuNTM2IDc1Ljk4MSw0NC4zOTYgNzUuMjI1LDQwLjk1TDkyLjExLDQwLjk1QzkyLjcsMzIuODg3IDg5LjUwNywyNy43NjIgODEuNjUyLDI3Ljc2MlpNNzUuMTQyLDM3LjQyMkM3NS42ODksMzMuODUyIDc4LjE2NywzMS42MjYgODEuNjk0LDMxLjYyNkM4NS4zNDgsMzEuNjI2IDg3Ljc0MiwzMy44MTEgODcuOTEsMzcuNDIzTDc1LjE0MywzNy40MjNMNzUuMTQyLDM3LjQyMlpNMTA0LjI0OCwyNy43NjJDOTcuNjEzLDI3LjgwNCA5Mi45NTEsMzIuMzgyIDkyLjk1MSwzOS4xNDVDOTIuOTUxLDQ1Ljg2NSA5Ny40ODgsNTAuNDQyIDEwNC4zNzYsNTAuNDQyQzEwOC4yNCw1MC40NDIgMTExLjQzMiw0OS4wNTcgMTEzLjYxNiw0Ni42NjJMMTExLjA1Myw0My45MzJDMTA5LjQxNSw0NS42MTIgMTA3LjE4OSw0Ni41MzYgMTA0Ljc1Myw0Ni41MzZDMTAxLjIyNiw0Ni41MzYgOTguNTc5LDQ0LjM5NiA5Ny44MjMsNDAuOTVMMTE0LjcwNyw0MC45NUMxMTUuMjk3LDMyLjg4NyAxMTIuMTA0LDI3Ljc2MiAxMDQuMjQ5LDI3Ljc2MkwxMDQuMjQ4LDI3Ljc2MlpNOTcuNzM4LDM3LjQyMkM5OC4yODUsMzMuODUyIDEwMC43NjIsMzEuNjI2IDEwNC4yOTEsMzEuNjI2QzEwNy45NDUsMzEuNjI2IDExMC4zMzksMzMuODExIDExMC41MDgsMzcuNDIzTDk3LjczOCwzNy40MjNMOTcuNzM4LDM3LjQyMlpNMTI5LjA3LDQ1LjE1QzEyNy43Nyw0NS43OCAxMjYuNzE4LDQ2LjExNyAxMjUuNzEsNDYuMTE3QzEyNC4xOTgsNDYuMTE3IDEyMy4zMTYsNDUuNDAzIDEyMy4zMTYsNDMuMDkzTDEyMy4zMTYsMzIuMzgzTDEyOS45MSwzMi4zODNMMTI5LjkxLDI4Ljc3TDEyMy4zMTYsMjguNzdMMTIzLjMxNiwyMi42NEwxMTguNTI5LDIyLjY0TDExOC41MjksMjguNzdMMTE1LjM3OSwyOC43N0wxMTUuMzc5LDMyLjM4MkwxMTguNTI5LDMyLjM4MkwxMTguNTI5LDQzLjk3NEMxMTguNTI5LDQ4LjU1MiAxMjEuNDI2LDUwLjQ4NCAxMjQuNzg1LDUwLjQ4NEMxMjYuNjc1LDUwLjQ4NCAxMjguNTI1LDQ5Ljg5NyAxMzAuMjg3LDQ4Ljg0NkwxMjkuMDY5LDQ1LjE1MUwxMjkuMDcsNDUuMTVaTTE2MS43ODgsMjcuNzYyQzE1Ny43MTQsMjcuNzYyIDE1NC43MzIsMjkuNCAxNTMuMzA1LDMzLjEzOEMxNTIuMjU1LDI5LjczOCAxNDkuNTI1LDI3Ljc2MiAxNDUuNTM1LDI3Ljc2MkMxNDEuODM4LDI3Ljc2MiAxMzguOTgyLDI5LjEwNyAxMzcuNDI4LDMyLjI1N0wxMzcuNDI4LDI3LjkzTDEzMi42NCwyNy45M0wxMzIuNjQsNTAuMjc0TDEzNy40MjgsNTAuMjc0TDEzNy40MjgsMzkuMjNDMTM3LjQyOCwzNS4zMjMgMTM5Ljc4LDMyLjM4MiAxNDMuNjQ0LDMyLjI1N0MxNDYuOTIsMzIuMjU3IDE0OC44OTQsMzQuMzE1IDE0OC44OTQsMzcuNzE3TDE0OC44OTQsNTAuMjc0TDE1My43MjQsNTAuMjc0TDE1My43MjQsMzkuMjNDMTUzLjcyNCwzNS4zMjMgMTU2LjAzNCwzMi4zODIgMTU5Ljg1NiwzMi4yNTdDMTYzLjEzMiwzMi4yNTcgMTY1LjE0OCwzNC4zMTUgMTY1LjE0OCwzNy43MTdMMTY1LjE0OCw1MC4yNzRMMTY5Ljk3OCw1MC4yNzRMMTY5Ljk3OCwzNi4zNzJDMTY5Ljk3OCwzMS4wMzggMTY2LjkxMiwyNy43NjIgMTYxLjc4OCwyNy43NjJaTTE3Ni43NCwxOC42MDdDMTc1LjE0NCwxOC42MDcgMTczLjkyNiwxOS44MjUgMTczLjkyNiwyMS41NDdDMTczLjkyNiwyMy4yMjcgMTc1LjE0NCwyNC40NDUgMTc2Ljc0LDI0LjQ0NUMxNzguMzM2LDI0LjQ0NSAxNzkuNTU0LDIzLjIyNSAxNzkuNTU0LDIxLjU0NUMxNzkuNTU0LDE5LjgyNSAxNzguMzM2LDE4LjYwNyAxNzYuNzQsMTguNjA3Wk0xNzkuMTM0LDUwLjI3NEwxNzkuMTM0LDI3LjkzTDE3NC4zNDYsMjcuOTNMMTc0LjM0Niw1MC4yNzRMMTc5LjEzNCw1MC4yNzRaTTE5Mi4yOCwzNS41NzRMMTg3LjI4MiwyNy45MzFMMTgxLjczOCwyNy45MzFMMTg5LjA4OCwzOC44MDlMMTgxLjE5Miw1MC4yNzVMMTg2LjU2OCw1MC4yNzVMMTkyLjI4LDQyLjA4NUwxOTcuNjE0LDUwLjI3NUwyMDMuMTU4LDUwLjI3NUwxOTUuNDcyLDM4LjgwOUwyMDIuNjU0LDI3LjkzMkwxOTcuMzYyLDI3LjkzMkwxOTIuMjgsMzUuNTc2TDE5Mi4yOCwzNS41NzRaIiBzdHlsZT0iZmlsbDpyZ2IoNTMsMTAzLDEyNCk7ZmlsbC1ydWxlOm5vbnplcm87Ii8+CiAgICA8L2c+Cjwvc3ZnPgo='

// Hardcoded width and height are taken from the image's intrinsic size.
const WORDMARK_IMAGE_INTRINSIC_WIDTH = 160
const WORDMARK_IMAGE_INTRINSIC_HEIGHT = 28
const WORDMARK_MARGIN = 4

/**
 * Draws a "made with Streetmix" watermark on the lower right of the image.
 *
 * @todo Make it work with rtl
 * @param {CanvasRenderingContext2D} ctx - the canvas context to draw on.
 * @param {Number} dpi - scale factor of image.
 * @param {Boolean} invert - if `true`, render light text for dark background
 */
function drawWatermark (ctx, dpi, invert) {
  const text = t('export.watermark', 'Made with {{streetmixWordmark}}')

  // Separate string so that we can render a wordmark with an image
  const strings = text.replace(/{{/g, '||{{').replace(/}}/g, '}}||').split('||')

  // Set text render options
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `normal 700 ${WATERMARK_TEXT_SIZE * dpi}px Lato,sans-serif`
  ctx.fillStyle = invert ? WATERMARK_LIGHT_COLOR : WATERMARK_DARK_COLOR

  // Set starting X/Y positions so that watermark is aligned right and bottom of image
  const startRightX = ctx.canvas.width - (WATERMARK_RIGHT_MARGIN * dpi)
  const startBottomY = ctx.canvas.height - (WATERMARK_BOTTOM_MARGIN * dpi)

  // Set wordmark width and height based on image scale (dpi)
  const logoWidth = WORDMARK_IMAGE_INTRINSIC_WIDTH * dpi
  const logoHeight = WORDMARK_IMAGE_INTRINSIC_HEIGHT * dpi

  // Keep track of where we are on the X-position.
  let currentRightX = startRightX

  // Render each part of the string.
  for (let i = strings.length - 1; i >= 0; i--) {
    const string = strings[i]

    // If we see the wordmark placeholder, render the image.
    if (string === '{{streetmixWordmark}}') {
      const margin = WORDMARK_MARGIN * dpi
      const logoLeftX = currentRightX - logoWidth - margin
      const logoTopY = startBottomY - logoHeight + dpi // Additional adjustment for visual alignment

      ctx.drawImage(WORDMARK_IMAGE, logoLeftX, logoTopY, logoWidth, logoHeight)

      // Update X position.
      currentRightX = logoLeftX - margin
    } else {
      ctx.fillText(string, currentRightX, startBottomY)

      // Update X position.
      currentRightX = currentRightX - ctx.measureText(string).width
    }
  }
}

export function drawStreetThumbnail (ctx, street, thumbnailWidth, thumbnailHeight,
  dpi, multiplier, silhouette, bottomAligned,
  transparentSky, segmentNamesAndWidths, streetName, watermark = true) {
  // Calculations

  // Determine how wide the street is
  let occupiedWidth = 0
  for (let segment of street.segments) {
    occupiedWidth += segment.width
  }

  var offsetTop
  if (bottomAligned) {
    offsetTop = thumbnailHeight - (180 * multiplier)
  } else {
    offsetTop = (thumbnailHeight + (5 * TILE_SIZE * multiplier)) / 2
  }
  if (segmentNamesAndWidths) {
    offsetTop -= SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING * multiplier
  }

  var offsetLeft = (thumbnailWidth - (occupiedWidth * TILE_SIZE * multiplier)) / 2
  var buildingOffsetLeft = (thumbnailWidth - (street.width * TILE_SIZE * multiplier)) / 2

  var groundLevel = offsetTop + (135 * multiplier)

  const horizonLine = (groundLevel + (20 * multiplier)) * dpi

  // Sky
  if (!transparentSky) {
    const env = getEnvirons(street.environment)

    // Solid color fill
    if (env.backgroundColor) {
      ctx.fillStyle = env.backgroundColor
      ctx.fillRect(0, 0, thumbnailWidth * dpi, horizonLine)
    }

    // Background image fill
    if (env.backgroundImage) {
      const STARS_WIDTH = 2000
      const STARS_HEIGHT = 1333
      for (let i = 0; i < Math.floor(thumbnailHeight / STARS_HEIGHT) + 1; i++) {
        for (let j = 0; j < Math.floor(thumbnailWidth / STARS_WIDTH) + 1; j++) {
          ctx.drawImage(images.get('/images/stars.svg').img,
            0, 0, STARS_WIDTH * 2, STARS_HEIGHT * 2,
            j * SKY_WIDTH * dpi, i * STARS_HEIGHT * dpi, SKY_WIDTH * dpi, STARS_HEIGHT * dpi)
          console.log('drawing', images.get('/images/stars.svg').img, i, j)
        }
      }
    }

    // Gradient fill
    if (env.backgroundGradient) {
      const gradient = ctx.createLinearGradient(0, 0, 0, horizonLine)

      // Make color stops
      const stops = makeCanvasGradientStopArray(env.backgroundGradient)
      for (let i = 0; i < stops.length; i++) {
        const [ color, stop ] = stops[i]
        gradient.addColorStop(stop, color)
      }

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, thumbnailWidth * dpi, horizonLine)
    }

    // const SUPERMOON = true
    // if (SUPERMOON) {
    //   console.log(images.get('/images/super-blood-wolf-moon.png').img)
    //   ctx.drawImage(images.get('/images/super-blood-wolf-moon.png').img,
    //     0.7 * thumbnailWidth, 0.33 * thumbnailHeight, 128 * dpi, 128 * dpi)
    // }

    const SKY_FRONT_HEIGHT = 280
    const SKY_REAR_HEIGHT = 250

    // TODO document magic numbers
    // y1 = top edge of sky-front image, bottom of image should hit groundlevel
    const y1 = groundLevel - SKY_FRONT_HEIGHT

    // Handle cloud opacity
    ctx.save()
    ctx.globalAlpha = env.cloudOpacity || 1

    for (let i = 0; i < Math.floor(thumbnailWidth / SKY_WIDTH) + 1; i++) {
      ctx.drawImage(images.get('/images/sky-front.svg').img,
        0, 0, SKY_WIDTH * 2, SKY_FRONT_HEIGHT * 2,
        i * SKY_WIDTH * dpi, y1 * dpi, SKY_WIDTH * dpi, SKY_FRONT_HEIGHT * dpi)
    }

    // TODO document magic numbers
    // y2 = top edge of sky-rear is 120 pixels above the top edge of sky-front
    const y2 = groundLevel - SKY_FRONT_HEIGHT - 120

    for (let i = 0; i < Math.floor(thumbnailWidth / SKY_WIDTH) + 1; i++) {
      ctx.drawImage(images.get('/images/sky-rear.svg').img,
        0, 0, SKY_WIDTH * 2, SKY_REAR_HEIGHT * 2,
        i * SKY_WIDTH * dpi, y2 * dpi, SKY_WIDTH * dpi, SKY_REAR_HEIGHT * dpi)
    }
    ctx.restore()
  }

  // Dirt

  ctx.fillStyle = BACKGROUND_DIRT_COLOUR
  ctx.fillRect(0, horizonLine, thumbnailWidth * dpi, (25 * multiplier) * dpi)

  ctx.fillRect(0, groundLevel * dpi,
    ((thumbnailWidth / 2) - (street.width * TILE_SIZE * multiplier / 2)) * dpi,
    (20 * multiplier) * dpi)

  ctx.fillRect(((thumbnailWidth / 2) + (street.width * TILE_SIZE * multiplier / 2)) * dpi,
    groundLevel * dpi,
    thumbnailWidth * dpi,
    (20 * multiplier) * dpi)

  // Buildings

  const buildingWidth = buildingOffsetLeft / multiplier

  // Left building
  const x1 = (thumbnailWidth / 2) - (street.width * TILE_SIZE * multiplier / 2)
  const leftBuilding = BUILDINGS[street.leftBuildingVariant]
  const leftOverhang = (typeof leftBuilding.overhangWidth === 'number') ? leftBuilding.overhangWidth : 0
  drawBuilding(ctx, street.leftBuildingVariant, street.leftBuildingHeight,
    'left', buildingWidth, groundLevel,
    x1 - ((buildingWidth - leftOverhang) * multiplier),
    multiplier, dpi)

  // Right building
  const x2 = (thumbnailWidth / 2) + (street.width * TILE_SIZE * multiplier / 2)
  const rightBuilding = BUILDINGS[street.rightBuildingVariant]
  const rightOverhang = (typeof rightBuilding.overhangWidth === 'number') ? rightBuilding.overhangWidth : 0
  drawBuilding(ctx, street.rightBuildingVariant, street.rightBuildingHeight,
    'right', buildingWidth, groundLevel,
    x2 - (rightOverhang * multiplier),
    multiplier, dpi)

  // Segments

  var originalOffsetLeft = offsetLeft

  // Collect z-indexes
  const zIndexes = []
  for (let segment of street.segments) {
    const segmentInfo = getSegmentInfo(segment.type)

    if (zIndexes.indexOf(segmentInfo.zIndex) === -1) {
      zIndexes.push(segmentInfo.zIndex)
    }
  }

  // Render objects at each z-index level
  for (let zIndex of zIndexes) {
    let offsetLeft = originalOffsetLeft

    for (let segment of street.segments) {
      const segmentInfo = getSegmentInfo(segment.type)

      if (segmentInfo.zIndex === zIndex) {
        const variantInfo = getSegmentVariantInfo(segment.type, segment.variantString)
        const dimensions = getVariantInfoDimensions(variantInfo, segment.width)

        drawSegmentContents(ctx, segment.type, segment.variantString,
          segment.width, offsetLeft + (dimensions.left * TILE_SIZE * multiplier),
          offsetTop, segment.randSeed, multiplier, dpi)
      }

      offsetLeft += segment.width * TILE_SIZE * multiplier
    }
  }

  // Segment names background
  if (segmentNamesAndWidths || silhouette) {
    ctx.fillStyle = BOTTOM_BACKGROUND
    ctx.fillRect(0, (groundLevel + (GROUND_BASELINE_HEIGHT * multiplier)) * dpi,
      thumbnailWidth * dpi, (thumbnailHeight - groundLevel - (GROUND_BASELINE_HEIGHT * multiplier)) * dpi)
  }

  // Segment names
  if (segmentNamesAndWidths) {
    let offsetLeft = originalOffsetLeft
    ctx.save()

    // TODO const
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 0.25 * dpi
    ctx.font = `normal 300 ${13 * dpi}px Lato`
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    for (let i in street.segments) {
      const segment = street.segments[i]
      const availableWidth = segment.width * TILE_SIZE * multiplier

      let left = offsetLeft

      if (i === 0) {
        left--
      }

      // Left line
      drawLine(ctx,
        left, (groundLevel + (GROUND_BASELINE_HEIGHT * multiplier)),
        left, (groundLevel + (125 * multiplier)), dpi)

      const x = (offsetLeft + (availableWidth / 2)) * dpi

      // Width label
      let text = prettifyWidth(segment.width, street.units)
      let textWidth = ctx.measureText(text).width / dpi

      while ((textWidth > availableWidth - (10 * multiplier)) && (text.indexOf(' ') !== -1)) {
        text = text.substr(0, text.lastIndexOf(' '))
        textWidth = ctx.measureText(text).width / dpi
      }

      ctx.fillText(text, x, (groundLevel + (60 * multiplier)) * dpi)

      // Segment name label
      const name = getLocaleSegmentName(segment.type, segment.variantString)
      const nameWidth = ctx.measureText(name).width / dpi

      if (nameWidth <= availableWidth - (10 * multiplier)) {
        ctx.fillText(name, x, (groundLevel + (83 * multiplier)) * dpi)
      }

      offsetLeft += availableWidth
    }

    // Final right-hand side line
    const left = offsetLeft + 1
    drawLine(ctx,
      left, (groundLevel + (GROUND_BASELINE_HEIGHT * multiplier)),
      left, (groundLevel + (125 * multiplier)), dpi)

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
    let text = street.name || t('street.default-name', 'Unnamed St')

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
    const x1 = (thumbnailWidth * dpi / 2) - ((measurement.width / 2) + (45 * dpi))
    const x2 = (thumbnailWidth * dpi / 2) + ((measurement.width / 2) + (45 * dpi))
    const y1 = (75 - 60) * dpi
    const y2 = (75 + 60) * dpi
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1)

    // Street nameplate border
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 5 * dpi
    ctx.strokeRect(x1 + (5 * dpi * 2), y1 + (5 * dpi * 2), x2 - x1 - (5 * dpi * 4), y2 - y1 - (5 * dpi * 4))

    const x = thumbnailWidth * dpi / 2

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
