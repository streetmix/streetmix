var MAX_CANVAS_HEIGHT = 2048

var BUILDING_DESTINATION_SCREEN = 1
var BUILDING_DESTINATION_THUMBNAIL = 2

var BUILDING_SPACE = 360

var DEFAULT_BUILDING_HEIGHT_LEFT = 4
var DEFAULT_BUILDING_HEIGHT_RIGHT = 3
var DEFAULT_BUILDING_VARIANT_LEFT = 'narrow'
var DEFAULT_BUILDING_VARIANT_RIGHT = 'wide'
var DEFAULT_BUILDING_HEIGHT_EMPTY = 1
var DEFAULT_BUILDING_VARIANT_EMPTY = 'grass'

var BUILDING_VARIANTS = ['waterfront', 'grass', 'fence', 'parking-lot',
  'residential', 'narrow', 'wide']
var BUILDING_VARIANT_NAMES = ['Waterfront', 'Grass', 'Empty lot', 'Parking lot',
  'Home', 'Building', 'Building']

var MAX_BUILDING_HEIGHT = 20

function _getBuildingAttributes (street, left) {
  var buildingVariant = left ? street.leftBuildingVariant : street.rightBuildingVariant
  var flooredBuilding = _isFlooredBuilding(buildingVariant)

  // Non-directional

  switch (buildingVariant) {
    case 'narrow':
      var width = 216
      var floorRoofWidth = 216
      var variantsCount = 1
      var tileset = 2

      var floorHeight = 10
      var roofHeight = 2
      var mainFloorHeight = 14
      break
    case 'wide':
      var width = 396
      var floorRoofWidth = 396
      var variantsCount = 1
      var tileset = 3

      var floorHeight = 10
      var roofHeight = 2
      var mainFloorHeight = 14
      break
    case 'residential':
      var width = 396
      var floorRoofWidth = 240
      var variantsCount = 0

      var floorHeight = 10
      var roofHeight = 6
      var mainFloorHeight = 24.5
      break
    case 'waterfront':
      var height = 12 * TILE_SIZE
      break
    case 'parking-lot':
      var height = 28 * TILE_SIZE
      break
    case 'fence':
      var height = 12 * TILE_SIZE
      break
    case 'grass':
      var height = 6 * TILE_SIZE
      break
  }
  // Directional

  if (left) {
    switch (buildingVariant) {
      case 'narrow':
        var tilePositionX = 1512 + 17
        var tilePositionY = 576 - 1
        break
      case 'wide':
        var tilePositionX = 1956
        var tilePositionY = 576 - 24 * 2
        break
      case 'residential':
        var tileset = 3
        var tilePositionX = 1956 + 382 + 204
        var tilePositionY = 576 + 740 / 2 - 1 - 12 + 8
        break
    }
  } else {
    switch (buildingVariant) {
      case 'narrow':
        var tilePositionX = 1728 + 13
        var tilePositionY = 576 - 1
        break
      case 'wide':
        var tilePositionX = 2351
        var tilePositionY = 576 - 24 * 2 - 1
        break
      case 'residential':
        var tileset = 2
        var tilePositionX = 1956 + 382 + 204 + 25 - 1008 - 12 - 1 + 48
        var tilePositionY = 576 + 740 / 2 - 1 - 12 + 237 + 6
        break
    }
  }

  if (flooredBuilding) {
    var floorCount = left ? street.leftBuildingHeight : street.rightBuildingHeight
    var height = (roofHeight + floorHeight * (floorCount - 1) + mainFloorHeight) * TILE_SIZE + 45
    var realHeight = height - 45 - 6
  }

  return { tilePositionX: tilePositionX, tilePositionY: tilePositionY,
    width: width, variantsCount: variantsCount, tileset: tileset,
    mainFloorHeight: mainFloorHeight, floorHeight: floorHeight,
    flooredBuilding: flooredBuilding, floorRoofWidth: floorRoofWidth,
    floorCount: floorCount,
    realHeight: realHeight,
  roofHeight: roofHeight, height: height, buildingVariant: buildingVariant }
}

// TODO change to array
function _isFlooredBuilding (buildingVariant) {
  if ((buildingVariant == 'narrow') || (buildingVariant == 'wide') ||
    (buildingVariant == 'residential')) {
    return true
  } else {
    return false
  }
}

function _drawBuilding (ctx, destination, street, left, totalWidth,
  totalHeight, bottomAligned, offsetLeft, offsetTop,
  multiplier) {
  var attr = _getBuildingAttributes(street, left)

  if (bottomAligned) {
    offsetTop += totalHeight - attr.height * multiplier
  }

  if (!attr.flooredBuilding) {
    switch (attr.buildingVariant) {
      case 'fence':
        var tileset = 1
        if (left) {
          var x = 1344 / 2
        } else {
          var x = 1224 / 2
        }
        var width = 48
        var y = 0
        var height = 168 + 12 - 24 - 24 - 24
        var offsetY = 23 + 24
        offsetTop -= 45

        if (left) {
          var posShift = (totalWidth % width) - 121
        } else {
          var posShift = 25
        }
        break
      case 'grass':
        var tileset = 1
        var x = 1104 / 2
        var width = 48
        var y = 0
        var height = 168 + 12
        var offsetY = 23 + 24 - 6 * 12
        offsetTop -= 45

        if (left) {
          var posShift = (totalWidth % width) - 121
        } else {
          var posShift = 25
        }
        break

      case 'parking-lot':
        var tileset = 3
        var width = 216
        var height = 576 / 2
        var offsetY = 3 + 45
        offsetTop -= 45

        if (left) {
          var posShift = (totalWidth % width) - width - width - 25
          var y = 12 + 298

          var x = 815 + 162 * 12
          var lastX = 815 + 162 * 12 + 9 * 24
        } else {
          var posShift = 25
          var y = 12

          var x = 815 + 162 * 12 + 9 * 24
          var firstX = 815 + 162 * 12
        }
        break

      case 'waterfront':
        var tileset = 1
        var width = 120
        var height = 192 / 2
        var offsetY = 24 + 24 + 45
        offsetTop -= 45

        if (left) {
          var posShift = (totalWidth % width) - width - width - 25
          var y = 120

          var x = 0
          var lastX = 120
        } else {
          var posShift = 25
          var y = 456 / 2

          var x = 120
          var firstX = 0
        }
        break
    }

    var count = Math.floor(totalWidth / width) + 2

    for (var i = 0; i < count; i++) {
      if ((i == 0) && (typeof firstX != 'undefined')) {
        var currentX = firstX
      } else if ((i == count - 1) && (typeof lastX != 'undefined')) {
        var currentX = lastX
      } else {
        var currentX = x
      }

      _drawSegmentImage(tileset, ctx,
        currentX, y, width, height,
        offsetLeft + (posShift + i * width) * multiplier,
        offsetTop + offsetY * multiplier,
        width * multiplier,
        height * multiplier)
    }
  } else {
    // Floored buildings

    if (left) {
      var leftPos = totalWidth - attr.width - 2
    } else {
      var leftPos = 0
    }

    offsetTop -= 45

    // bottom floor

    _drawSegmentImage(attr.tileset, ctx,
      attr.tilePositionX,
      attr.tilePositionY - 240 + 120 * attr.variantsCount,
      attr.width,
      attr.mainFloorHeight * TILE_SIZE + TILE_SIZE,
      offsetLeft + leftPos * multiplier,
      offsetTop + (attr.height - attr.mainFloorHeight * TILE_SIZE) * multiplier,
      attr.width * multiplier,
      (attr.mainFloorHeight * TILE_SIZE + TILE_SIZE) * multiplier)

    // middle floors

    var floorCorrection = left ? 0 : (attr.width - attr.floorRoofWidth)

    var randomGenerator = new RandomGenerator()
    randomGenerator.seed(0)

    for (var i = 1; i < attr.floorCount; i++) {
      if (attr.variantsCount == 0) {
        var variant = 0
      } else {
        var variant = Math.floor(randomGenerator.rand() * attr.variantsCount) + 1
      }

      _drawSegmentImage(attr.tileset, ctx,
        attr.tilePositionX + floorCorrection,
        attr.tilePositionY - 240 + 120 * attr.variantsCount - (attr.floorHeight * TILE_SIZE * variant),
        attr.floorRoofWidth,
        attr.floorHeight * TILE_SIZE,
        offsetLeft + (leftPos + floorCorrection) * multiplier,
        offsetTop + attr.height * multiplier - (attr.mainFloorHeight + attr.floorHeight * i) * TILE_SIZE * multiplier,
        attr.floorRoofWidth * multiplier,
        attr.floorHeight * TILE_SIZE * multiplier)
    }

    // roof

    _drawSegmentImage(attr.tileset, ctx,
      attr.tilePositionX + floorCorrection,
      attr.tilePositionY - 240 + 120 * attr.variantsCount - (attr.floorHeight * TILE_SIZE * attr.variantsCount + attr.roofHeight * TILE_SIZE),
      attr.floorRoofWidth,
      attr.roofHeight * TILE_SIZE,
      offsetLeft + (leftPos + floorCorrection) * multiplier,
      offsetTop + attr.height * multiplier - (attr.mainFloorHeight + attr.floorHeight * (attr.floorCount - 1) + attr.roofHeight) * TILE_SIZE * multiplier,
      attr.floorRoofWidth * multiplier,
      attr.roofHeight * TILE_SIZE * multiplier)
  }

  if ((street.remainingWidth < 0) && (destination == BUILDING_DESTINATION_SCREEN)) {
    ctx.save()
    ctx.globalCompositeOperation = 'source-atop'
    // TODO const
    ctx.fillStyle = 'rgba(204, 163, 173, .9)'
    ctx.fillRect(0, 0, totalWidth * system.hiDpi, totalHeight * system.hiDpi)
    ctx.restore()
  }
}

function _createBuilding (el, left) {
  var totalWidth = el.offsetWidth
  var attr = _getBuildingAttributes(street, left)
  var height = Math.min(MAX_CANVAS_HEIGHT, attr.height)
  var canvasEl = document.createElement('canvas')
  var oldCanvasEl = el.querySelector('canvas')

  canvasEl.width = totalWidth * system.hiDpi
  canvasEl.height = height * system.hiDpi
  canvasEl.style.width = totalWidth + 'px'
  canvasEl.style.height = height + 'px'

  // Replace previous canvas if present, otherwise append a new one
  if (oldCanvasEl) {
    el.replaceChild(canvasEl, oldCanvasEl)
  } else {
    el.appendChild(canvasEl)
  }

  var ctx = canvasEl.getContext('2d')
  _drawBuilding(ctx, BUILDING_DESTINATION_SCREEN, street, left,
    totalWidth, height, true, 0, 0, 1.0)
}

function _buildingHeightUpdated () {
  _saveStreetToServerIfNecessary()
  _createBuildings()
}

function _changeBuildingHeight (left, increment) {
  if (left) {
    if (increment) {
      if (street.leftBuildingHeight < MAX_BUILDING_HEIGHT) {
        street.leftBuildingHeight++
      }
    } else if (street.leftBuildingHeight > 1) {
      street.leftBuildingHeight--
    }
  } else {
    if (increment) {
      if (street.rightBuildingHeight < MAX_BUILDING_HEIGHT) {
        street.rightBuildingHeight++
      }
    } else if (street.rightBuildingHeight > 1) {
      street.rightBuildingHeight--
    }
  }

  _infoBubble.updateHeightInContents(left)
  _buildingHeightUpdated()
}

function _createBuildings () {
  var leftEl = document.querySelector('#street-section-left-building')
  var rightEl = document.querySelector('#street-section-right-building')

  _createBuilding(leftEl, true)
  _createBuilding(rightEl, false)
}

function _onBuildingMouseEnter (event) {
  if (this.id == 'street-section-left-building') {
    var type = INFO_BUBBLE_TYPE_LEFT_BUILDING
  } else {
    var type = INFO_BUBBLE_TYPE_RIGHT_BUILDING
  }

  _infoBubble.considerShowing(event, this, type)
  _resumeFadeoutControls()
}

function _onBuildingMouseLeave (event) {
  if (event.pointerType !== 'mouse') return

  _infoBubble.dontConsiderShowing()
}

function _updateBuildingPosition () {
  var el = document.querySelector('#street-section-editable')
  var pos = _getElAbsolutePos(el)

  var width = pos[0] + 25

  if (width < 0) {
    width = 0
  }

  document.querySelector('#street-section-left-building').style.width = width + 'px'
  document.querySelector('#street-section-right-building').style.width = width + 'px'

  document.querySelector('#street-section-left-building').style.left = (-width + 25) + 'px'
  document.querySelector('#street-section-right-building').style.right = (-width + 25) + 'px'

  document.querySelector('#street-section-dirt').style.marginLeft = -width + 'px'
  document.querySelector('#street-section-dirt').style.marginRight = -width + 'px'
}
