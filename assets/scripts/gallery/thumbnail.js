/* global system, images */

import { drawLine } from '../util/canvas_drawing'
import { prettifyWidth } from '../util/width_units'
import { SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING } from '../streets/image'
import { StreetName } from '../streets/name_sign'
import { BUILDING_DESTINATION_THUMBNAIL, drawBuilding } from '../segments/buildings'
import { SEGMENT_INFO } from '../segments/info'
import {
  TILE_SIZE,
  getVariantInfoDimensions,
  drawSegmentContents
} from '../segments/view'

const SKY_COLOUR = 'rgb(169, 204, 219)'
const SKY_WIDTH = 250
const BOTTOM_BACKGROUND = 'rgb(216, 211, 203)'
const BACKGROUND_DIRT_COLOUR = 'rgb(53, 45, 39)'

export function drawStreetThumbnail (ctx, street, thumbnailWidth, thumbnailHeight,
  multiplier, silhouette, bottomAligned,
  transparentSky, segmentNamesAndWidths, streetName) {
  // Calculations

  // Determine how wide the street is
  let occupiedWidth = 0
  for (let segment of street.segments) {
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
  var buildingOffsetLeft = (thumbnailWidth - street.width * TILE_SIZE * multiplier) / 2

  var groundLevel = offsetTop + 135 * multiplier

  // Sky

  if (!transparentSky) {
    ctx.fillStyle = SKY_COLOUR
    ctx.fillRect(0, 0, thumbnailWidth * system.hiDpi, (groundLevel + 20 * multiplier) * system.hiDpi)

    // TODO document magic numbers
    const y1 = groundLevel - 280

    for (let i = 0; i < Math.floor(thumbnailWidth / SKY_WIDTH) + 1; i++) {
      ctx.drawImage(images['/images/sky-front.png'],
        0, 0, SKY_WIDTH * 2, 280 * 2,
        i * SKY_WIDTH * system.hiDpi, y1 * system.hiDpi, SKY_WIDTH * system.hiDpi, 280 * system.hiDpi)
    }

    // TODO document magic numbers
    const y2 = groundLevel - 280 - 120

    for (let i = 0; i < Math.floor(thumbnailWidth / SKY_WIDTH) + 1; i++) {
      ctx.drawImage(images['/images/sky-rear.png'],
        0, 0, SKY_WIDTH * 2, 120 * 2,
        i * SKY_WIDTH * system.hiDpi, y2 * system.hiDpi, SKY_WIDTH * system.hiDpi, 120 * system.hiDpi)
    }
  }

  // Dirt

  ctx.fillStyle = BACKGROUND_DIRT_COLOUR
  ctx.fillRect(0, (groundLevel + 20 * multiplier) * system.hiDpi,
    thumbnailWidth * system.hiDpi, (25 * multiplier) * system.hiDpi)

  ctx.fillRect(0, groundLevel * system.hiDpi,
    (thumbnailWidth / 2 - street.width * TILE_SIZE * multiplier / 2) * system.hiDpi,
    (20 * multiplier) * system.hiDpi)

  ctx.fillRect((thumbnailWidth / 2 + street.width * TILE_SIZE * multiplier / 2) * system.hiDpi,
    groundLevel * system.hiDpi,
    thumbnailWidth * system.hiDpi,
    (20 * multiplier) * system.hiDpi)

  // Segment names

  ctx.fillStyle = BOTTOM_BACKGROUND
  ctx.fillRect(0, (groundLevel + 45 * multiplier) * system.hiDpi,
    thumbnailWidth * system.hiDpi, (thumbnailHeight - groundLevel - 45 * multiplier) * system.hiDpi)

  // Buildings

  const buildingWidth = buildingOffsetLeft / multiplier

  const x1 = thumbnailWidth / 2 - street.width * TILE_SIZE * multiplier / 2
  drawBuilding(ctx, BUILDING_DESTINATION_THUMBNAIL, street, true, buildingWidth, groundLevel + 45, true, x1 - (buildingWidth - 25) * multiplier, 0, multiplier)

  const x2 = thumbnailWidth / 2 + street.width * TILE_SIZE * multiplier / 2
  drawBuilding(ctx, BUILDING_DESTINATION_THUMBNAIL, street, false, buildingWidth, groundLevel + 45, true, x2 - 25 * multiplier, 0, multiplier)

  // Segments

  var originalOffsetLeft = offsetLeft

  // Collect z-indexes
  var zIndexes = []
  for (let segment of street.segments) {
    const segmentInfo = SEGMENT_INFO[segment.type]

    if (zIndexes.indexOf(segmentInfo.zIndex) === -1) {
      zIndexes.push(segmentInfo.zIndex)
    }
  }

  for (let zIndex of zIndexes) {
    let offsetLeft = originalOffsetLeft

    for (let segment of street.segments) {
      const segmentInfo = SEGMENT_INFO[segment.type]

      if (segmentInfo.zIndex === zIndex) {
        const variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString]
        const dimensions = getVariantInfoDimensions(variantInfo, segment.width * TILE_SIZE, 1)

        drawSegmentContents(ctx, segment.type, segment.variantString,
          segment.width * TILE_SIZE * multiplier,
          offsetLeft + dimensions.left * TILE_SIZE * multiplier, offsetTop, segment.randSeed, multiplier, false)
      }

      offsetLeft += segment.width * TILE_SIZE * multiplier
    }
  }

  // Segment names
  if (segmentNamesAndWidths) {
    let offsetLeft = originalOffsetLeft
    ctx.save()

    // TODO const
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 0.5
    ctx.font = 'normal 300 26px Lato'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    for (let i in street.segments) {
      const segment = street.segments[i]
      const segmentInfo = SEGMENT_INFO[segment.type]
      const variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString]
      const availableWidth = segment.width * TILE_SIZE * multiplier

      let left = offsetLeft

      if (i === 0) {
        left--
      }

      drawLine(ctx,
        left, (groundLevel + 45 * multiplier),
        left, (groundLevel + 125 * multiplier))

      const x = (offsetLeft + availableWidth / 2) * system.hiDpi

      let text = prettifyWidth(segment.width)
      let textWidth = ctx.measureText(text).width / 2
      while ((textWidth > availableWidth - 10 * multiplier) && (text.indexOf(' ') !== -1)) {
        text = text.substr(0, text.lastIndexOf(' '))
        textWidth = ctx.measureText(text).width / 2
      }
      ctx.fillText(text, x,
        (groundLevel + 60 * multiplier) * system.hiDpi)

      const name = variantInfo.name || segmentInfo.name
      const nameWidth = ctx.measureText(name).width / 2
      if (nameWidth <= availableWidth - 10 * multiplier) {
        ctx.fillText(name, x,
          (groundLevel + 83 * multiplier) * system.hiDpi)
      }

      offsetLeft += availableWidth
    }

    var left = offsetLeft + 1
    drawLine(ctx,
      left, (groundLevel + 45 * multiplier),
      left, (groundLevel + 125 * multiplier))

    ctx.restore()
  }

  // Silhouette

  if (silhouette) {
    ctx.globalCompositeOperation = 'source-atop'
    // TODO const
    ctx.fillStyle = 'rgb(240, 240, 240)'
    ctx.fillRect(0, 0, thumbnailWidth * system.hiDpi, thumbnailHeight * system.hiDpi)
  }

  // Street name

  if (streetName) {
    let text = street.name

    ctx.textAlign = 'center'
    ctx.textBaseline = 'center'

    let fallbackUnicodeFont

    if (StreetName.prototype.needsUnicodeFont(text)) {
      fallbackUnicodeFont = true
      ctx.font = 'normal 400 140px sans-serif'
    } else {
      fallbackUnicodeFont = false
      ctx.font = 'normal 400 160px Roadgeek'
    }

    var measurement = ctx.measureText(text)

    var needToBeElided = false
    while (measurement.width > (thumbnailWidth - 200) * system.hiDpi) {
      text = text.substr(0, text.length - 1)
      measurement = ctx.measureText(text)
      needToBeElided = true
    }
    if (needToBeElided) {
      text += '…'
    }

    ctx.fillStyle = 'white'
    const x1 = thumbnailWidth * system.hiDpi / 2 - (measurement.width / 2 + 75 * system.hiDpi)
    const x2 = thumbnailWidth * system.hiDpi / 2 + (measurement.width / 2 + 75 * system.hiDpi)
    const y1 = (75 - 60) * system.hiDpi
    const y2 = (75 + 60) * system.hiDpi
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1)

    ctx.strokeStyle = 'black'
    ctx.lineWidth = 10
    ctx.strokeRect(x1 + 10 * 2, y1 + 10 * 2, x2 - x1 - 10 * 4, y2 - y1 - 10 * 4)

    const x = thumbnailWidth * system.hiDpi / 2

    let baselineCorrection

    if (fallbackUnicodeFont) {
      baselineCorrection = 24
    } else {
      baselineCorrection = 27
    }

    const y = (75 + baselineCorrection) * system.hiDpi

    ctx.strokeStyle = 'transparent'
    ctx.fillStyle = 'black'
    ctx.fillText(text, x, y)
  }
}
