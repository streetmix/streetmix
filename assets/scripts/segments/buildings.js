import {
  INFO_BUBBLE_TYPE_RIGHT_BUILDING,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  infoBubble
} from '../info_bubble/info_bubble'
import { getStreet, saveStreetToServerIfNecessary } from '../streets/data_model'
import { getElAbsolutePos } from '../util/helpers'
import { RandomGenerator } from '../util/random'
import { images } from '../app/load_resources'
import { resumeFadeoutControls } from './resizing'
import { TILE_SIZE, TILESET_POINT_PER_PIXEL, drawSegmentImage } from './view'
import store from '../store'

const MAX_CANVAS_HEIGHT = 2048

const BUILDING_DESTINATION_SCREEN = 1
export const BUILDING_DESTINATION_THUMBNAIL = 2

export const BUILDING_SPACE = 360

export const DEFAULT_BUILDING_HEIGHT_LEFT = 4
export const DEFAULT_BUILDING_HEIGHT_RIGHT = 3
export const DEFAULT_BUILDING_VARIANT_LEFT = 'narrow'
export const DEFAULT_BUILDING_VARIANT_RIGHT = 'wide'
export const DEFAULT_BUILDING_HEIGHT_EMPTY = 1
export const DEFAULT_BUILDING_VARIANT_EMPTY = 'grass'

export const BUILDINGS = {
  'waterfront': {
    id: 'waterfront',
    label: 'Waterfront',
    spriteId: 'buildings--waterfront-', // append side later
    hasFloors: false
  },
  'grass': {
    id: 'grass',
    label: 'Grass',
    spriteId: 'buildings--grass-', // append side later
    hasFloors: false
  },
  'fence': {
    id: 'fence',
    label: 'Empty lot',
    spriteId: 'buildings--fenced-lot-', // append side later
    hasFloors: false
  },
  'parking-lot': {
    id: 'parking-lot',
    label: 'Parking lot',
    spriteId: 'buildings--parking-lot-', // append side later
    hasFloors: false
  },
  'residential': {
    id: 'residential',
    label: 'Home',
    spriteId: 'buildings--residential-', // append side later
    hasFloors: true,
    variantsCount: 0,
    floorHeight: 10,
    roofHeight: 6,
    mainFloorHeight: 24.5
  },
  'narrow': {
    id: 'narrow',
    label: 'Building',
    spriteId: 'buildings--apartments-narrow-', // append side later
    hasFloors: true,
    variantsCount: 1,
    floorHeight: 10,
    roofHeight: 2,
    mainFloorHeight: 14
  },
  'wide': {
    id: 'wide',
    label: 'Building',
    spriteId: 'buildings--apartments-wide-', // append side later
    hasFloors: true,
    variantsCount: 1,
    floorHeight: 10,
    roofHeight: 2,
    mainFloorHeight: 14
  }
}

export const MAX_BUILDING_HEIGHT = 20

export function getBuildingAttributes (street, left) {
  const buildingVariant = left ? street.leftBuildingVariant : street.rightBuildingVariant
  const floorCount = left ? street.leftBuildingHeight : street.rightBuildingHeight
  return getBuildingAttributesByVariant(buildingVariant, left, floorCount)
}

/**
 *
 * @param {string} buildingVariant - string id of building
 * @param {Boolean} left - is this on the left
 * @param {Number} floorCount - how many floors is it, if the building has floors
 */
function getBuildingAttributesByVariant (buildingVariant, left, floorCount) {
  let width, height
  const building = BUILDINGS[buildingVariant]
  const side = (left) ? 'left' : 'right'
  const spriteId = BUILDINGS[buildingVariant].spriteId + side
  let offsetLeft = 0
  let spriteHeight

  // Non-directional

  switch (buildingVariant) {
    // Define sprite heights based on svg intrinsic value
    case 'waterfront': {
      const svg = images.get(spriteId)
      height = svg.height / TILESET_POINT_PER_PIXEL
      break
    }
    case 'parking-lot': {
      const svg = images.get(spriteId)
      height = svg.height / TILESET_POINT_PER_PIXEL
      break
    }
    case 'fence': {
      // TODO: use intrinsic height, but we need to figure out what the offsetY and offsetTop numbers are first
      // const svg = images.get('buildings--fenced-lot-left') // same for right
      // height = svg.height / TILESET_POINT_PER_PIXEL
      height = 12 * TILE_SIZE
      break
    }
    case 'grass': {
      // TODO: use intrinsic height, but we need to figure out what the offsetY and offsetTop numbers are first
      // const svg = images.get('buildings--grass')
      // height = svg.height / TILESET_POINT_PER_PIXEL
      height = 6 * TILE_SIZE
      break
    }
    case 'narrow':
      width = 216
      spriteHeight = 624 // actual px height
      break
    case 'wide':
      width = 384
      spriteHeight = 624 // actual px height
      break
    case 'residential':
      width = 384
      spriteHeight = 732 // actual px height
      break
  }

  // Directional
  if (left) {
    switch (buildingVariant) {
      case 'narrow':
        offsetLeft = -9
        break
      case 'wide':
        offsetLeft = -5
        break
      case 'residential':
        offsetLeft = -25
        break
    }
  } else {
    switch (buildingVariant) {
      case 'narrow':
        offsetLeft = 9
        break
      case 'wide':
        offsetLeft = 5
        break
      case 'residential':
        offsetLeft = 25
        break
    }
  }

  if (building.hasFloors) {
    height = ((building.roofHeight + (building.floorHeight * (floorCount - 1)) + building.mainFloorHeight) * TILE_SIZE) + 45
  }

  return {
    spriteId: spriteId,
    width: width,

    variantsCount: building.variantsCount,
    floorHeight: building.floorHeight,
    roofHeight: building.roofHeight,
    mainFloorHeight: building.mainFloorHeight,

    floorCount: floorCount,

    height: height,
    spriteHeight,
    buildingVariant: buildingVariant,
    offsetLeft
  }
}

/**
 * transition function with weird stuff in it
 *
 * @todo Document magic numbers used here
 * @param {Object} street - street data
 * @param {Boolean} left - is the building on the left or what
 */
export function calculateRealHeightNumber (street, left, floorCount) {
  return (getBuildingAttributesByVariant(street, left, floorCount).height - 45 - 6) / TILE_SIZE // todo: document magic numbers
}

export function drawBuilding (ctx, destination, street, left, totalWidth,
  totalHeight, bottomAligned, offsetLeft, offsetTop,
  multiplier, dpi) {
  const attr = getBuildingAttributes(street, left)

  if (bottomAligned) {
    offsetTop += totalHeight - (attr.height * multiplier)
  }

  if (!BUILDINGS[attr.buildingVariant].hasFloors) {
    drawSingleFloorBuilding(attr.buildingVariant, ctx, left, totalWidth, offsetLeft, offsetTop, multiplier, dpi)
  } else {
    drawMultiFloorBuilding(attr, ctx, left, totalWidth, offsetLeft, offsetTop, multiplier, dpi)
  }

  // If street width is exceeded, fade buildings
  if ((street.remainingWidth < 0) && (destination === BUILDING_DESTINATION_SCREEN)) {
    shadeInContext(ctx)
  }
}

function drawSingleFloorBuilding (buildingVariant, ctx, left, totalWidth, offsetLeft, offsetTop, multiplier, dpi) {
  // posShift = a building sprite can overlap the sidewalk by a certain amount. a posShift
  // value of 25 is NO overlap. a posShift value of 0 is 25 pixels of overlap.
  let x, posShift, width, offsetY, lastX, firstX, currentX, spriteId

  switch (buildingVariant) {
    case 'fence': {
      spriteId = (left) ? 'buildings--fenced-lot-left' : 'buildings--fenced-lot-right'

      const svg = images.get(spriteId)
      width = svg.width / TILESET_POINT_PER_PIXEL

      offsetY = 23 + 24 + 2 // todo: document magic number
      offsetTop -= 45 // todo: document magic number

      if (left) {
        posShift = (totalWidth % width) - (width + width + 25)
      } else {
        posShift = 25
      }
      break
    }
    case 'grass': {
      spriteId = 'buildings--grass'

      const svg = images.get(spriteId)
      width = svg.width / TILESET_POINT_PER_PIXEL

      offsetY = 23 + 24 + 2 // todo: document magic number
      offsetTop -= 45 // todo: document magic number

      if (left) {
        posShift = (totalWidth % width) - (width + width + 25)
      } else {
        posShift = 25
      }
      break
    }
    case 'parking-lot': {
      offsetY = 0
      offsetTop -= 45 // todo: document magic number

      spriteId = (left) ? 'buildings--parking-lot-left' : 'buildings--parking-lot-right'

      const svg = images.get(spriteId)
      width = svg.width / TILESET_POINT_PER_PIXEL / 2 // 2 = halfway point is where repeat starts.

      if (left) {
        posShift = (totalWidth % width) - (width + width + 25) // do not overhang right edge

        x = 0 // repeat the left half of this sprite
        lastX = svg.width / 2 // anchor the right half of this sprite
      } else {
        posShift = 25 // do not overhang left edge

        x = svg.width / 2 // repeat the right half of this sprite
        firstX = 0 // anchor the left half of this sprite
      }
      break
    }
    case 'waterfront': {
      offsetY = 0
      offsetTop -= 0

      spriteId = (left) ? 'buildings--waterfront-left' : 'buildings--waterfront-right'

      const svg = images.get(spriteId)
      width = svg.width / TILESET_POINT_PER_PIXEL / 2 // 2 = halfway point is where repeat starts.

      if (left) {
        posShift = (totalWidth % width) - (width + width + 25) // do not overhang right edge

        x = 0 // repeat the left half of this sprite
        lastX = svg.width / 2 // anchor the right half of this sprite
      } else {
        posShift = 25 // do not overhang left edge

        x = svg.width / 2 // repeat the right half of this sprite
        firstX = 0 // anchor the left half of this sprite
      }
      break
    }
  }

  const count = Math.floor(totalWidth / width) + 2

  for (let i = 0; i < count; i++) {
    if ((i === 0) && (typeof firstX !== 'undefined')) {
      currentX = firstX
    } else if ((i === count - 1) && (typeof lastX !== 'undefined')) {
      currentX = lastX
    } else {
      currentX = x
    }

    drawSegmentImage(spriteId, ctx,
      currentX, null,
      width, null,
      offsetLeft + ((posShift + (i * width)) * multiplier),
      offsetTop + (offsetY * multiplier),
      width, null, multiplier, dpi)
  }
}

function drawMultiFloorBuilding (attr, ctx, left, totalWidth, offsetLeft, offsetTop, multiplier, dpi) {
  // Floored buildings
  const leftPos = (left) ? totalWidth - attr.width + attr.offsetLeft : 0 + attr.offsetLeft

  offsetTop -= 45

  // bottom floor
  drawSegmentImage(attr.spriteId, ctx,
    0,
    attr.spriteHeight - (attr.mainFloorHeight * TILE_SIZE * TILESET_POINT_PER_PIXEL), // 0 - 240 + (120 * attr.variantsCount),
    null,
    attr.mainFloorHeight * TILE_SIZE,
    offsetLeft + (leftPos * multiplier),
    offsetTop + ((attr.height - (attr.mainFloorHeight * TILE_SIZE)) * multiplier),
    null,
    attr.mainFloorHeight * TILE_SIZE,
    multiplier, dpi)

  // middle floors
  const randomGenerator = new RandomGenerator()
  randomGenerator.seed = 0

  for (let i = 1; i < attr.floorCount; i++) {
    const variant = (attr.variantsCount === 0) ? 0 : Math.floor(randomGenerator.rand() * attr.variantsCount) + 1

    drawSegmentImage(attr.spriteId, ctx,
      0,
      attr.spriteHeight - (attr.mainFloorHeight * TILE_SIZE * TILESET_POINT_PER_PIXEL) - (attr.floorHeight * TILE_SIZE * variant * TILESET_POINT_PER_PIXEL),
      // 168 - (attr.floorHeight * TILE_SIZE * variant), // 0 - 240 + (120 * attr.variantsCount) - (attr.floorHeight * TILE_SIZE * variant),
      null,
      attr.floorHeight * TILE_SIZE,
      offsetLeft + (leftPos * multiplier),
      offsetTop + (attr.height * multiplier) - ((attr.mainFloorHeight + (attr.floorHeight * i)) * TILE_SIZE * multiplier),
      null,
      attr.floorHeight * TILE_SIZE,
      multiplier, dpi)
  }

  // roof
  drawSegmentImage(attr.spriteId, ctx,
    0,
    0,
    null,
    attr.roofHeight * TILE_SIZE,
    offsetLeft + (leftPos * multiplier),
    offsetTop + (attr.height * multiplier) - ((attr.mainFloorHeight + (attr.floorHeight * (attr.floorCount - 1)) + attr.roofHeight) * TILE_SIZE * multiplier),
    null,
    attr.roofHeight * TILE_SIZE,
    multiplier, dpi)
}

/**
 * Fills the building rendered area with a color
 *
 * @param {CanvasRenderingContext2D} ctx
 */
function shadeInContext (ctx) {
  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  // TODO const
  ctx.fillStyle = 'rgba(204, 163, 173, .9)'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.restore()
}

function createBuilding (el, left) {
  var street = getStreet()
  var totalWidth = el.offsetWidth
  var attr = getBuildingAttributes(street, left)
  var height = Math.min(MAX_CANVAS_HEIGHT, attr.height)
  var canvasEl = document.createElement('canvas')
  var oldCanvasEl = el.querySelector('canvas')
  const dpi = store.getState().system.hiDpi

  canvasEl.width = totalWidth * dpi
  canvasEl.height = height * dpi
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
    totalWidth, height, true, 0, 0, 1.0, dpi)
}

export function buildingHeightUpdated () {
  saveStreetToServerIfNecessary()
  createBuildings()
}

// transition: when state changes, update legacy street object.
// todo: remove when no longer needed
export function initBuildingReduxTransitionSubscriber () {
  let oldLeftBuildingHeight
  let oldRightBuildingHeight
  store.subscribe(() => {
    const state = store.getState().street
    const street = getStreet()
    let changed = false
    if (state.leftBuildingHeight !== oldLeftBuildingHeight) {
      street.leftBuildingHeight = state.leftBuildingHeight
      oldLeftBuildingHeight = state.leftBuildingHeight
      changed = true
    }
    if (state.rightBuildingHeight !== oldRightBuildingHeight) {
      street.rightBuildingHeight = state.rightBuildingHeight
      oldRightBuildingHeight = state.rightBuildingHeight
      changed = true
    }
    if (changed) {
      buildingHeightUpdated()
    }
  })
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
