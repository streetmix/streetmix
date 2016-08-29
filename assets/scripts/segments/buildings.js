import {
  INFO_BUBBLE_TYPE_RIGHT_BUILDING,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  infoBubble
} from '../info_bubble/info_bubble'
import { system } from '../preinit/system_capabilities'
import { getStreet, saveStreetToServerIfNecessary } from '../streets/data_model'
import { getElAbsolutePos } from '../util/helpers'
import { RandomGenerator } from '../util/random'
import { resumeFadeoutControls } from './resizing'
import { TILE_SIZE, drawSegmentImage } from './view'

const MAX_CANVAS_HEIGHT = 2048

const BUILDING_DESTINATION_SCREEN = 1
export const BUILDING_DESTINATION_THUMBNAIL = 2

export const BUILDING_SPACE = 360

export const DEFAULT_BUILDING_HEIGHT_LEFT = 5
export const DEFAULT_BUILDING_HEIGHT_RIGHT = 6
export const DEFAULT_BUILDING_VARIANT_LEFT = 'wide'
export const DEFAULT_BUILDING_VARIANT_RIGHT = 'wide'
export const DEFAULT_BUILDING_HEIGHT_EMPTY = 1
export const DEFAULT_BUILDING_VARIANT_EMPTY = 'grass'

export const BUILDING_VARIANTS = ['waterfront', 'grass', 'fence', 'parking-lot',
  'residential', 'narrow', 'wide']
export const BUILDING_VARIANT_NAMES = ['Waterfront', 'Grass', 'Empty lot', 'Parking lot',
  'Home', 'Building', 'Building']

export const MAX_BUILDING_HEIGHT = 20

export function getBuildingAttributes (street, left) {
  let width, floorRoofWidth, variantsCount, tileset, floorHeight, roofHeight
  let mainFloorHeight, height, tilePositionX, tilePositionY
  var buildingVariant = left ? street.leftBuildingVariant : street.rightBuildingVariant
  var flooredBuilding = isFlooredBuilding(buildingVariant)

  // Non-directional

  switch (buildingVariant) {
    case 'narrow':
      width = 216
      floorRoofWidth = 216
      variantsCount = 1
      tileset = 2

      floorHeight = 10
      roofHeight = 2
      mainFloorHeight = 14
      break
    case 'wide':
      width = 396
      floorRoofWidth = 396
      variantsCount = 1
      tileset = 3

      floorHeight = 10
      roofHeight = 2
      mainFloorHeight = 14
      break
    case 'residential':
      width = 396
      floorRoofWidth = 240
      variantsCount = 0

      floorHeight = 10
      roofHeight = 6
      mainFloorHeight = 24.5
      break
    case 'waterfront':
      height = 12 * TILE_SIZE
      break
    case 'parking-lot':
      height = 28 * TILE_SIZE
      break
    case 'fence':
      height = 12 * TILE_SIZE
      break
    case 'grass':
      height = 6 * TILE_SIZE
      break
  }
  // Directional

  if (left) {
    switch (buildingVariant) {
      case 'narrow':
        tilePositionX = 1512 + 17
        tilePositionY = 576 - 1
        break
      case 'wide':
        tilePositionX = 1956
        tilePositionY = 576 - 24 * 2
        break
      case 'residential':
        tileset = 3
        tilePositionX = 1956 + 382 + 204
        tilePositionY = 576 + 740 / 2 - 1 - 12 + 8
        break
    }
  } else {
    switch (buildingVariant) {
      case 'narrow':
        tilePositionX = 1728 + 13
        tilePositionY = 576 - 1
        break
      case 'wide':
        tilePositionX = 2351
        tilePositionY = 576 - 24 * 2 - 1
        break
      case 'residential':
        tileset = 2
        tilePositionX = 1956 + 382 + 204 + 25 - 1008 - 12 - 1 + 48
        tilePositionY = 576 + 740 / 2 - 1 - 12 + 237 + 6
        break
    }
  }

  if (flooredBuilding) {
    var floorCount = left ? street.leftBuildingHeight : street.rightBuildingHeight
    height = (roofHeight + floorHeight * (floorCount - 1) + mainFloorHeight) * TILE_SIZE + 45
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
export function isFlooredBuilding (buildingVariant) {
  if ((buildingVariant === 'narrow') || (buildingVariant === 'wide') ||
    (buildingVariant === 'residential')) {
    return true
  } else {
    return false
  }
}

export function drawBuilding (ctx, destination, street, left, totalWidth,
  totalHeight, bottomAligned, offsetLeft, offsetTop,
  multiplier) {
  let x, y, posShift, leftPos, tileset, width, height, offsetY, lastX, firstX
  let variant, currentX
  var attr = getBuildingAttributes(street, left)

  if (bottomAligned) {
    offsetTop += totalHeight - attr.height * multiplier
  }

  if (!attr.flooredBuilding) {
    switch (attr.buildingVariant) {
      case 'fence':
        tileset = 1
        if (left) {
          x = 1344 / 2
        } else {
          x = 1224 / 2
        }
        width = 48
        y = 0
        height = 168 + 12 - 24 - 24 - 24
        offsetY = 23 + 24
        offsetTop -= 45

        if (left) {
          posShift = (totalWidth % width) - 121
        } else {
          posShift = 25
        }
        break
      case 'grass':
        tileset = 1
        x = 1104 / 2
        width = 48
        y = 0
        height = 168 + 12
        offsetY = 23 + 24 - 6 * 12
        offsetTop -= 45

        if (left) {
          posShift = (totalWidth % width) - 121
        } else {
          posShift = 25
        }
        break

      case 'parking-lot':
        tileset = 3
        width = 216
        height = 576 / 2
        offsetY = 3 + 45
        offsetTop -= 45

        if (left) {
          posShift = (totalWidth % width) - width - width - 25
          y = 12 + 298

          x = 815 + 162 * 12
          lastX = 815 + 162 * 12 + 9 * 24
        } else {
          posShift = 25
          y = 12

          x = 815 + 162 * 12 + 9 * 24
          firstX = 815 + 162 * 12
        }
        break

      case 'waterfront':
        tileset = 1
        width = 120
        height = 192 / 2
        offsetY = 24 + 24 + 45
        offsetTop -= 45

        if (left) {
          posShift = (totalWidth % width) - width - width - 25
          y = 120

          x = 0
          lastX = 120
        } else {
          posShift = 25
          y = 456 / 2

          x = 120
          firstX = 0
        }
        break
    }

    var count = Math.floor(totalWidth / width) + 2

    for (let i = 0; i < count; i++) {
      if ((i === 0) && (typeof firstX !== 'undefined')) {
        currentX = firstX
      } else if ((i === count - 1) && (typeof lastX !== 'undefined')) {
        currentX = lastX
      } else {
        currentX = x
      }

      drawSegmentImage(tileset, ctx,
        currentX, y, width, height,
        offsetLeft + (posShift + i * width) * multiplier,
        offsetTop + offsetY * multiplier,
        width * multiplier,
        height * multiplier)
    }
  } else {
    // Floored buildings

    if (left) {
      leftPos = totalWidth - attr.width - 2
    } else {
      leftPos = 0
    }

    offsetTop -= 45

    // bottom floor

    drawSegmentImage(attr.tileset, ctx,
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
    randomGenerator.seed = 0

    for (let i = 1; i < attr.floorCount; i++) {
      if (attr.variantsCount === 0) {
        variant = 0
      } else {
        variant = Math.floor(randomGenerator.rand() * attr.variantsCount) + 1
      }

      drawSegmentImage(attr.tileset, ctx,
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

    drawSegmentImage(attr.tileset, ctx,
      attr.tilePositionX + floorCorrection,
      attr.tilePositionY - 240 + 120 * attr.variantsCount - (attr.floorHeight * TILE_SIZE * attr.variantsCount + attr.roofHeight * TILE_SIZE),
      attr.floorRoofWidth,
      attr.roofHeight * TILE_SIZE,
      offsetLeft + (leftPos + floorCorrection) * multiplier,
      offsetTop + attr.height * multiplier - (attr.mainFloorHeight + attr.floorHeight * (attr.floorCount - 1) + attr.roofHeight) * TILE_SIZE * multiplier,
      attr.floorRoofWidth * multiplier,
      attr.roofHeight * TILE_SIZE * multiplier)
  }

  if ((street.remainingWidth < 0) && (destination === BUILDING_DESTINATION_SCREEN)) {
    ctx.save()
    ctx.globalCompositeOperation = 'source-atop'
    // TODO const
    ctx.fillStyle = 'rgba(204, 163, 173, .9)'
    ctx.fillRect(0, 0, totalWidth * system.hiDpi, totalHeight * system.hiDpi)
    ctx.restore()
  }
}

function createBuilding (el, left) {
  var street = getStreet()
  var totalWidth = el.offsetWidth
  var attr = getBuildingAttributes(street, left)
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
  drawBuilding(ctx, BUILDING_DESTINATION_SCREEN, street, left,
    totalWidth, height, true, 0, 0, 1.0)
}

export function buildingHeightUpdated () {
  saveStreetToServerIfNecessary()
  createBuildings()
}

export function changeBuildingHeight (left, increment) {
  let street = getStreet()
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

  infoBubble.updateHeightInContents(left)
  buildingHeightUpdated()
}

export function createBuildings () {
  var leftEl = document.querySelector('#street-section-left-building')
  var rightEl = document.querySelector('#street-section-right-building')

  createBuilding(leftEl, true)
  createBuilding(rightEl, false)
}

export function onBuildingMouseEnter (event) {
  let type
  if (this.id === 'street-section-left-building') {
    type = INFO_BUBBLE_TYPE_LEFT_BUILDING
  } else {
    type = INFO_BUBBLE_TYPE_RIGHT_BUILDING
  }

  infoBubble.considerShowing(event, this, type)
  resumeFadeoutControls()
}

export function onBuildingMouseLeave (event) {
  if (event.pointerType !== 'mouse') return

  infoBubble.dontConsiderShowing()
}

export function updateBuildingPosition () {
  var el = document.querySelector('#street-section-editable')
  var pos = getElAbsolutePos(el)

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
