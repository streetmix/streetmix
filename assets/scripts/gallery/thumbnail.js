import { images } from '../app/load_resources'
import { drawLine } from '../util/canvas_drawing'
import { prettifyWidth } from '../util/width_units'
import { SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING } from '../streets/image'
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

const SKY_COLOUR = 'rgb(169, 204, 219)'
// TODO: replace SKY_WIDTH with image's natural width
const SKY_WIDTH = 250
const BOTTOM_BACKGROUND = 'rgb(216, 211, 203)'
const BACKGROUND_DIRT_COLOUR = 'rgb(53, 45, 39)'

export function drawStreetThumbnail (ctx, street, thumbnailWidth, thumbnailHeight,
  dpi, multiplier, silhouette, bottomAligned,
  transparentSky, segmentNamesAndWidths, streetName) {
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

  // Sky

  if (!transparentSky) {
    ctx.fillStyle = SKY_COLOUR
    ctx.fillRect(0, 0, thumbnailWidth * dpi, (groundLevel + (20 * multiplier)) * dpi)

    // TODO document magic numbers
    const y1 = groundLevel - 280

    for (let i = 0; i < Math.floor(thumbnailWidth / SKY_WIDTH) + 1; i++) {
      ctx.drawImage(images.get('/images/sky-front.svg').img,
        0, 0, SKY_WIDTH * 2, 280 * 2,
        i * SKY_WIDTH * dpi, y1 * dpi, SKY_WIDTH * dpi, 280 * dpi)
    }

    // TODO document magic numbers
    const y2 = groundLevel - 280 - 120

    for (let i = 0; i < Math.floor(thumbnailWidth / SKY_WIDTH) + 1; i++) {
      ctx.drawImage(images.get('/images/sky-rear.svg').img,
        0, 0, SKY_WIDTH * 2, 120 * 2,
        i * SKY_WIDTH * dpi, y2 * dpi, SKY_WIDTH * dpi, 120 * dpi)
    }
  }

  // Dirt

  ctx.fillStyle = BACKGROUND_DIRT_COLOUR
  ctx.fillRect(0, (groundLevel + (20 * multiplier)) * dpi,
    thumbnailWidth * dpi, (25 * multiplier) * dpi)

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
  drawBuilding(ctx, street,
    true, buildingWidth, groundLevel,
    x1 - ((buildingWidth - leftOverhang) * multiplier),
    multiplier, dpi)

  // Right building
  const x2 = (thumbnailWidth / 2) + (street.width * TILE_SIZE * multiplier / 2)
  const rightBuilding = BUILDINGS[street.rightBuildingVariant]
  const rightOverhang = (typeof rightBuilding.overhangWidth === 'number') ? rightBuilding.overhangWidth : 0
  drawBuilding(ctx, street,
    false, buildingWidth, groundLevel,
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
}
