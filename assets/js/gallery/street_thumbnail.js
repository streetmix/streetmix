var SKY_COLOUR = 'rgb(169, 204, 219)'
var SKY_WIDTH = 250
var BOTTOM_BACKGROUND = 'rgb(216, 211, 203)'

function _drawStreetThumbnail (ctx, street, thumbnailWidth, thumbnailHeight,
  multiplier, silhouette, bottomAligned,
  transparentSky, segmentNamesAndWidths, streetName) {
  // Calculations

  var occupiedWidth = 0
  for (var i in street.segments) {
    occupiedWidth += street.segments[i].width
  }

  if (bottomAligned) {
    var offsetTop = thumbnailHeight - 180 * multiplier
  } else {
    var offsetTop = (thumbnailHeight + 5 * TILE_SIZE * multiplier) / 2
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

    var y = groundLevel - 280

    for (var i = 0; i < Math.floor(thumbnailWidth / SKY_WIDTH) + 1; i++) {
      ctx.drawImage(images['/images/sky-front.png'],
        0, 0, SKY_WIDTH * 2, 280 * 2,
        i * SKY_WIDTH * system.hiDpi, y * system.hiDpi, SKY_WIDTH * system.hiDpi, 280 * system.hiDpi)
    }

    var y = groundLevel - 280 - 120

    for (var i = 0; i < Math.floor(thumbnailWidth / SKY_WIDTH) + 1; i++) {
      ctx.drawImage(images['/images/sky-rear.png'],
        0, 0, SKY_WIDTH * 2, 120 * 2,
        i * SKY_WIDTH * system.hiDpi, y * system.hiDpi, SKY_WIDTH * system.hiDpi, 120 * system.hiDpi)
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

  var buildingWidth = buildingOffsetLeft / multiplier

  var x = thumbnailWidth / 2 - street.width * TILE_SIZE * multiplier / 2
  _drawBuilding(ctx, BUILDING_DESTINATION_THUMBNAIL, street, true, buildingWidth, groundLevel + 45, true, x - (buildingWidth - 25) * multiplier, 0, multiplier)

  var x = thumbnailWidth / 2 + street.width * TILE_SIZE * multiplier / 2
  _drawBuilding(ctx, BUILDING_DESTINATION_THUMBNAIL, street, false, buildingWidth, groundLevel + 45, true, x - 25 * multiplier, 0, multiplier)

  // Segments

  var originalOffsetLeft = offsetLeft

  // Collect z-indexes
  var zIndexes = []
  for (var i in street.segments) {
    var segment = street.segments[i]
    var segmentInfo = SEGMENT_INFO[segment.type]

    if (zIndexes.indexOf(segmentInfo.zIndex) == -1) {
      zIndexes.push(segmentInfo.zIndex)
    }
  }

  for (var j in zIndexes) {
    var zIndex = zIndexes[j]

    offsetLeft = originalOffsetLeft

    for (var i in street.segments) {
      var segment = street.segments[i]
      var segmentInfo = SEGMENT_INFO[segment.type]

      if (segmentInfo.zIndex == zIndex) {
        var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString]
        var dimensions = _getVariantInfoDimensions(variantInfo, segment.width * TILE_SIZE, 1)

        _drawSegmentContents(ctx, segment.type, segment.variantString,
          segment.width * TILE_SIZE * multiplier,
          offsetLeft + dimensions.left * TILE_SIZE * multiplier, offsetTop, segment.randSeed, multiplier, false)
      }

      offsetLeft += segment.width * TILE_SIZE * multiplier
    }
  }

  // Segment names

  var offsetLeft = originalOffsetLeft

  if (segmentNamesAndWidths) {
    ctx.save()

    // TODO const
    ctx.strokeStyle = 'black'
    ctx.lineWidth = .5
    ctx.font = 'normal 300 26px Lato'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    for (var i = 0; i < street.segments.length; i++) {
      var segment = street.segments[i]

      var segmentInfo = SEGMENT_INFO[segment.type]
      var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString]
      var name = variantInfo.name || segmentInfo.name

      var left = offsetLeft
      var availableWidth = segment.width * TILE_SIZE * multiplier

      if (i == 0) {
        left--
      }

      _drawLine(ctx,
        left, (groundLevel + 45 * multiplier),
        left, (groundLevel + 125 * multiplier))

      var x = (offsetLeft + availableWidth / 2) * system.hiDpi

      var text = _prettifyWidth(segment.width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP)
      var width = ctx.measureText(text).width / 2
      while ((width > availableWidth - 10 * multiplier) && (text.indexOf(' ') != -1)) {
        text = text.substr(0, text.lastIndexOf(' '))
        width = ctx.measureText(text).width / 2
      }
      ctx.fillText(text, x,
        (groundLevel + 60 * multiplier) * system.hiDpi)

      var width = ctx.measureText(name).width / 2
      if (width <= availableWidth - 10 * multiplier) {
        ctx.fillText(name, x,
          (groundLevel + 83 * multiplier) * system.hiDpi)
      }

      // grid
      /*for (var j = 1; j < Math.floor(availableWidth / TILE_SIZE); j++) {
        _drawLine(ctx,
            left + j * TILE_SIZE, (groundLevel + 45 * multiplier),
            left + j * TILE_SIZE, (groundLevel + 55 * multiplier))
      }*/

      offsetLeft += availableWidth
    }

    var left = offsetLeft + 1
    _drawLine(ctx,
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
    var text = street.name

    ctx.textAlign = 'center'
    ctx.textBaseline = 'center'

    if (StreetName.prototype.needsUnicodeFont(text)) {
      var fallbackUnicodeFont = true
      ctx.font = 'normal 400 140px sans-serif'
    } else {
      var fallbackUnicodeFont = false
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
    var x1 = thumbnailWidth * system.hiDpi / 2 - (measurement.width / 2 + 75 * system.hiDpi)
    var x2 = thumbnailWidth * system.hiDpi / 2 + (measurement.width / 2 + 75 * system.hiDpi)
    var y1 = (75 - 60) * system.hiDpi
    var y2 = (75 + 60) * system.hiDpi
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1)

    ctx.strokeStyle = 'black'
    ctx.lineWidth = 10
    ctx.strokeRect(x1 + 10 * 2, y1 + 10 * 2, x2 - x1 - 10 * 4, y2 - y1 - 10 * 4)

    var x = thumbnailWidth * system.hiDpi / 2

    if (fallbackUnicodeFont) {
      var baselineCorrection = 24
    } else {
      var baselineCorrection = 27
    }

    var y = (75 + baselineCorrection) * system.hiDpi

    ctx.strokeStyle = 'transparent'
    ctx.fillStyle = 'black'
    ctx.fillText(text, x, y)
  }
}
