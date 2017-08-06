import { getInitializing } from '../app/initialization'
import { images } from '../app/load_resources'
import { msg } from '../app/messages'
import { infoBubble, INFO_BUBBLE_TYPE_SEGMENT } from '../info_bubble/info_bubble'
import { debug } from '../preinit/debug_settings'
import { system } from '../preinit/system_capabilities'
import {
  getStreet,
  saveStreetToServerIfNecessary,
  createDataFromDom
} from '../streets/data_model'
import { updateUndoButtons } from '../streets/undo_stack'
import { recalculateWidth } from '../streets/width'
import { getElAbsolutePos } from '../util/helpers'
import { prettifyWidth } from '../util/width_units'
import { draggingMove } from './drag_and_drop'
import { SEGMENT_INFO } from './info'
import { drawProgrammaticPeople } from './people'
import {
  RESIZE_TYPE_INITIAL,
  suppressMouseEnter,
  resizeSegment,
  applyWarningsToSegments
} from './resizing'
import { getVariantArray, getVariantString } from './variant_utils'

const TILESET_POINT_PER_PIXEL = 2.0
export const TILE_SIZE = 12 // pixels
const TILESET_CORRECTION = [null, 0, -84, -162]

const CANVAS_HEIGHT = 480
const CANVAS_GROUND = 35
const CANVAS_BASELINE = CANVAS_HEIGHT - CANVAS_GROUND

const SEGMENT_Y_NORMAL = 265
const SEGMENT_Y_PALETTE = 20

const DRAGGING_MOVE_HOLE_WIDTH = 40

const SEGMENT_SWITCHING_TIME = 250

export function drawSegmentImageSVG (id, ctx, dx, dy, dw, dh) {
  if (!dw || !dh || dw <= 0 || dh <= 0) {
    return
  }

  // Set render dimensions based on pixel density
  dx *= system.hiDpi
  dy *= system.hiDpi
  dw *= system.hiDpi
  dh *= system.hiDpi

  // These rectangles are telling us that we're drawing at the right places.
  if (debug.canvasRectangles) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillRect(dx, dy, dw, dh)
  }

  // Draw the image to canvas
  const img = images[id]
  ctx.drawImage(img, dx, dy, dw, dh)
}

export function drawSegmentImage (tileset, ctx, sx, sy, sw, sh, dx, dy, dw, dh) {
  if (!sw || !sh || !dw || !dh) {
    return
  }

  if ((sw > 0) && (sh > 0) && (dw > 0) && (dh > 0)) {
    sx += TILESET_CORRECTION[tileset] * 12

    dx *= system.hiDpi
    dy *= system.hiDpi
    dw *= system.hiDpi
    dh *= system.hiDpi

    if (sx < 0) {
      dw += sx
      sx = 0
    }

    if (debug.canvasRectangles) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(dx, dy, dw, dh)
    }

    ctx.drawImage(images['/images/tiles-' + tileset + '.png'],
      sx * TILESET_POINT_PER_PIXEL, sy * TILESET_POINT_PER_PIXEL,
      sw * TILESET_POINT_PER_PIXEL, sh * TILESET_POINT_PER_PIXEL,
      dx, dy, dw, dh)
  }
}

export function getVariantInfoDimensions (variantInfo, initialSegmentWidth, multiplier) {
  let graphic, newLeft, newRight
  var segmentWidth = initialSegmentWidth / TILE_SIZE / multiplier

  var center = segmentWidth / 2
  var left = center
  var right = center

  if (variantInfo.graphics.center) {
    graphic = variantInfo.graphics.center
    for (let l = 0; l < graphic.length; l++) {
      newLeft = center - (graphic[l].width / 2) + (graphic[l].offsetX || 0)
      newRight = center + (graphic[l].width / 2) + (graphic[l].offsetX || 0)

      if (newLeft < left) {
        left = newLeft
      }
      if (newRight > right) {
        right = newRight
      }
    }
  }

  if (variantInfo.graphics.left) {
    graphic = variantInfo.graphics.left
    for (let l = 0; l < graphic.length; l++) {
      newLeft = graphic[l].offsetX || 0
      newRight = graphic[l].width + (graphic[l].offsetX || 0)

      if (newLeft < left) {
        left = newLeft
      }
      if (newRight > right) {
        right = newRight
      }
    }
  }

  if (variantInfo.graphics.right) {
    graphic = variantInfo.graphics.right
    for (let l = 0; l < graphic.length; l++) {
      newLeft = (segmentWidth) - (graphic[l].offsetX || 0) - graphic[l].width
      newRight = (segmentWidth) - (graphic[l].offsetX || 0)

      if (newLeft < left) {
        left = newLeft
      }
      if (newRight > right) {
        right = newRight
      }
    }
  }

  if (variantInfo.graphics.repeat && variantInfo.graphics.repeat[0]) {
    newLeft = center - (segmentWidth / 2)
    newRight = center + (segmentWidth / 2)

    if (newLeft < left) {
      left = newLeft
    }
    if (newRight > right) {
      right = newRight
    }
  }

  return { left: left, right: right, center: center }
}

export function drawSegmentContents (ctx, type, variantString, segmentWidth, offsetLeft, offsetTop, randSeed, multiplier, palette) {
  let repeatStartX, w, x
  var variantInfo = SEGMENT_INFO[type].details[variantString]

  var dimensions = getVariantInfoDimensions(variantInfo, segmentWidth, multiplier)
  var left = dimensions.left
  var center = dimensions.center

  if (variantInfo.graphics.repeat) {
    for (let l = 0; l < variantInfo.graphics.repeat.length; l++) {
      var repeatPositionX = variantInfo.graphics.repeat[l].x * TILE_SIZE
      var repeatPositionY = (variantInfo.graphics.repeat[l].y || 0) * TILE_SIZE
      w = variantInfo.graphics.repeat[l].width * TILE_SIZE * multiplier

      var count = Math.floor((segmentWidth / w) + 1)

      if (left < 0) {
        repeatStartX = -left * TILE_SIZE
      } else {
        repeatStartX = 0
      }

      for (var i = 0; i < count; i++) {
        // remainder
        if (i === count - 1) {
          w = segmentWidth - ((count - 1) * w)
        }

        drawSegmentImage(variantInfo.graphics.repeat[l].tileset, ctx,
          repeatPositionX, repeatPositionY,
          w, variantInfo.graphics.repeat[l].height * TILE_SIZE,
          offsetLeft + ((repeatStartX + (i * variantInfo.graphics.repeat[l].width * TILE_SIZE)) * multiplier),
          offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.repeat[l].offsetY || 0)),
          w,
          variantInfo.graphics.repeat[l].height * TILE_SIZE * multiplier)
      }
    }
  }

  if (variantInfo.graphics.left) {
    for (let l = 0; l < variantInfo.graphics.left.length; l++) {
      var leftPositionX = variantInfo.graphics.left[l].x * TILE_SIZE
      var leftPositionY = (variantInfo.graphics.left[l].y || 0) * TILE_SIZE

      w = variantInfo.graphics.left[l].width * TILE_SIZE

      x = 0 + ((-left + (variantInfo.graphics.left[l].offsetX || 0)) * TILE_SIZE * multiplier)

      drawSegmentImage(variantInfo.graphics.left[l].tileset, ctx,
        leftPositionX, leftPositionY,
        w, variantInfo.graphics.left[l].height * TILE_SIZE,
        offsetLeft + x,
        offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.left[l].offsetY || 0)),
        w * multiplier, variantInfo.graphics.left[l].height * TILE_SIZE * multiplier)
    }
  }

  if (variantInfo.graphics.right) {
    for (let l = 0; l < variantInfo.graphics.right.length; l++) {
      var rightPositionX = variantInfo.graphics.right[l].x * TILE_SIZE
      var rightPositionY = (variantInfo.graphics.right[l].y || 0) * TILE_SIZE

      w = variantInfo.graphics.right[l].width * TILE_SIZE

      x = (-left + (segmentWidth / TILE_SIZE / multiplier) - variantInfo.graphics.right[l].width - (variantInfo.graphics.right[l].offsetX || 0)) * TILE_SIZE * multiplier

      drawSegmentImage(variantInfo.graphics.right[l].tileset, ctx,
        rightPositionX, rightPositionY,
        w, variantInfo.graphics.right[l].height * TILE_SIZE,
        offsetLeft + x,
        offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.right[l].offsetY || 0)),
        w * multiplier, variantInfo.graphics.right[l].height * TILE_SIZE * multiplier)
    }
  }

  if (variantInfo.graphics.center) {
    for (let l = 0; l < variantInfo.graphics.center.length; l++) {
      var bkPositionX = (variantInfo.graphics.center[l].x || 0) * TILE_SIZE
      var bkPositionY = (variantInfo.graphics.center[l].y || 0) * TILE_SIZE

      var width = variantInfo.graphics.center[l].width

      x = (center - (variantInfo.graphics.center[l].width / 2) - left - (variantInfo.graphics.center[l].offsetX || 0)) * TILE_SIZE * multiplier

      drawSegmentImage(variantInfo.graphics.center[l].tileset, ctx,
        bkPositionX, bkPositionY,
        width * TILE_SIZE, variantInfo.graphics.center[l].height * TILE_SIZE,
        offsetLeft + x,
        offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.center[l].offsetY || 0)),
        width * TILE_SIZE * multiplier, variantInfo.graphics.center[l].height * TILE_SIZE * multiplier)
    }
  }

  if (type === 'sidewalk') {
    drawProgrammaticPeople(ctx, segmentWidth / multiplier, offsetLeft - (left * TILE_SIZE * multiplier), offsetTop, randSeed, multiplier, variantString)
  }
}

export function setSegmentContents (el, type, variantString, segmentWidth, randSeed, palette, quickUpdate) {
  let canvasEl
  var variantInfo = SEGMENT_INFO[type].details[variantString]

  var WIDTH_PALETTE_MULTIPLIER = 4 // Dupe from palette.js

  var multiplier = palette ? (WIDTH_PALETTE_MULTIPLIER / TILE_SIZE) : 1
  var dimensions = getVariantInfoDimensions(variantInfo, segmentWidth, multiplier)

  var totalWidth = dimensions.right - dimensions.left

  var offsetTop = palette ? SEGMENT_Y_PALETTE : SEGMENT_Y_NORMAL

  if (!quickUpdate) {
    var hoverBkEl = document.createElement('div')
    hoverBkEl.classList.add('hover-bk')
  }

  if (!quickUpdate) {
    canvasEl = document.createElement('canvas')
    canvasEl.classList.add('image')
  } else {
    canvasEl = el.querySelector('canvas')
  }
  canvasEl.width = totalWidth * TILE_SIZE * system.hiDpi
  canvasEl.height = CANVAS_BASELINE * system.hiDpi
  canvasEl.style.width = (totalWidth * TILE_SIZE) + 'px'
  canvasEl.style.height = CANVAS_BASELINE + 'px'
  canvasEl.style.left = (dimensions.left * TILE_SIZE * multiplier) + 'px'

  var ctx = canvasEl.getContext('2d')

  drawSegmentContents(ctx, type, variantString, segmentWidth, 0, offsetTop, randSeed, multiplier, palette)

  if (!quickUpdate) {
    const removeEl = el.querySelector('canvas')
    if (removeEl) removeEl.remove()
    el.appendChild(canvasEl)

    const removeEl2 = el.querySelector('.hover-bk')
    if (removeEl2) removeEl2.remove()
    el.appendChild(hoverBkEl)
  }
}

export function createSegment (type, variantString, width, isUnmovable, palette, randSeed) {
  let innerEl, dragHandleEl
  var el = document.createElement('div')
  el.classList.add('segment')
  el.setAttribute('type', type)
  el.setAttribute('variant-string', variantString)
  if (randSeed) {
    el.setAttribute('rand-seed', randSeed)
  }

  if (isUnmovable) {
    el.classList.add('unmovable')
  }

  if (!palette) {
    el.style.zIndex = SEGMENT_INFO[type].zIndex

    var variantInfo = SEGMENT_INFO[type].details[variantString]
    var name = variantInfo.name || SEGMENT_INFO[type].name

    innerEl = document.createElement('span')
    innerEl.classList.add('name')
    innerEl.setAttribute('data-i18n', 'segment-info:segments.' + type + '.name')
    innerEl.innerHTML = name
    el.appendChild(innerEl)

    innerEl = document.createElement('span')
    innerEl.classList.add('width')
    el.appendChild(innerEl)

    dragHandleEl = document.createElement('span')
    dragHandleEl.classList.add('drag-handle')
    dragHandleEl.classList.add('left')
    dragHandleEl.segmentEl = el
    dragHandleEl.innerHTML = '‹'
    el.appendChild(dragHandleEl)

    dragHandleEl = document.createElement('span')
    dragHandleEl.classList.add('drag-handle')
    dragHandleEl.classList.add('right')
    dragHandleEl.segmentEl = el
    dragHandleEl.innerHTML = '›'
    el.appendChild(dragHandleEl)

    innerEl = document.createElement('span')
    innerEl.classList.add('grid')
    el.appendChild(innerEl)
  } else {
    el.setAttribute('title', SEGMENT_INFO[type].name)
  }

  if (width) {
    resizeSegment(el, RESIZE_TYPE_INITIAL, width, true, palette, true)
  }

  if (!palette) {
    el.addEventListener('pointerenter', onSegmentMouseEnter)
    el.addEventListener('pointerleave', onSegmentMouseLeave)
  }
  return el
}

export function createSegmentDom (segment) {
  return createSegment(segment.type, segment.variantString,
    segment.width * TILE_SIZE, segment.unmovable, false, segment.randSeed)
}

function fillEmptySegment (el) {
  let innerEl
  innerEl = document.createElement('span')
  innerEl.classList.add('name')
  innerEl.textContent = msg('SEGMENT_NAME_EMPTY')
  innerEl.setAttribute('data-i18n', 'section.empty')
  el.appendChild(innerEl)

  innerEl = document.createElement('span')
  innerEl.classList.add('width')
  el.appendChild(innerEl)

  innerEl = document.createElement('span')
  innerEl.classList.add('grid')
  el.appendChild(innerEl)
}

export function fillEmptySegments () {
  fillEmptySegment(document.querySelector('#street-section-left-empty-space'))
  fillEmptySegment(document.querySelector('#street-section-right-empty-space'))
}

export function repositionSegments () {
  let width, el
  var left = 0
  var noMoveLeft = 0

  var extraWidth = 0

  let street = getStreet()
  for (let i in street.segments) {
    el = street.segments[i].el

    if (el === draggingMove.segmentBeforeEl) {
      left += DRAGGING_MOVE_HOLE_WIDTH
      extraWidth += DRAGGING_MOVE_HOLE_WIDTH

      if (!draggingMove.segmentAfterEl) {
        left += DRAGGING_MOVE_HOLE_WIDTH
        extraWidth += DRAGGING_MOVE_HOLE_WIDTH
      }
    }

    if (el.classList.contains('dragged-out')) {
      width = 0
    } else {
      width = parseFloat(el.getAttribute('data-width')) * TILE_SIZE
    }

    el.savedLeft = Math.round(left) // so we don’t have to use offsetLeft
    el.savedNoMoveLeft = Math.round(noMoveLeft) // so we don’t have to use offsetLeft
    el.savedWidth = Math.round(width)

    left += width
    noMoveLeft += width

    if (el === draggingMove.segmentAfterEl) {
      left += DRAGGING_MOVE_HOLE_WIDTH
      extraWidth += DRAGGING_MOVE_HOLE_WIDTH

      if (!draggingMove.segmentBeforeEl) {
        left += DRAGGING_MOVE_HOLE_WIDTH
        extraWidth += DRAGGING_MOVE_HOLE_WIDTH
      }
    }
  }

  var occupiedWidth = left
  var noMoveOccupiedWidth = noMoveLeft

  var mainLeft = Math.round(((street.width * TILE_SIZE) - occupiedWidth) / 2)
  var mainNoMoveLeft = Math.round(((street.width * TILE_SIZE) - noMoveOccupiedWidth) / 2)

  for (let i in street.segments) {
    el = street.segments[i].el

    el.savedLeft += mainLeft
    el.savedNoMoveLeft += mainNoMoveLeft

    if (system.cssTransform) {
      el.style[system.cssTransform] = 'translateX(' + el.savedLeft + 'px)'
      el.cssTransformLeft = el.savedLeft
    } else {
      el.style.left = el.savedLeft + 'px'
    }
  }

  if (system.cssTransform) {
    document.querySelector('#street-section-left-empty-space')
      .style[system.cssTransform] = 'translateX(' + (-extraWidth / 2) + 'px)'
    document.querySelector('#street-section-right-empty-space')
      .style[system.cssTransform] = 'translateX(' + (extraWidth / 2) + 'px)'
  } else {
    document.querySelector('#street-section-left-empty-space')
      .style.marginLeft = -(extraWidth / 2) + 'px'
    document.querySelector('#street-section-right-empty-space')
      .style.marginLeft = (extraWidth / 2) + 'px'
  }
}

export function changeSegmentVariant (dataNo, variantName, variantChoice, variantString) {
  let street = getStreet()
  var segment = street.segments[dataNo]

  if (variantString) {
    segment.variantString = variantString
    segment.variant = getVariantArray(segment.type, segment.variantString)
  } else {
    segment.variant[variantName] = variantChoice
    segment.variantString = getVariantString(segment.variant)
  }

  var el = createSegmentDom(segment)

  var oldEl = segment.el
  oldEl.parentNode.insertBefore(el, oldEl)
  switchSegmentElAway(oldEl)

  segment.el = el
  segment.el.dataNo = oldEl.dataNo
  street.segments[oldEl.dataNo].el = el

  switchSegmentElIn(el)
  el.classList.add('hover')
  el.classList.add('show-drag-handles')
  el.classList.add('immediate-show-drag-handles')
  el.classList.add('hide-drag-handles-when-inside-info-bubble')
  infoBubble.segmentEl = el
  infoBubble.segment = segment

  infoBubble.updateContents()

  repositionSegments()
  recalculateWidth()
  applyWarningsToSegments()

  saveStreetToServerIfNecessary()
}

export function switchSegmentElIn (el) {
  el.classList.add('switching-in-pre')

  window.setTimeout(function () {
    var pos = getElAbsolutePos(el)
    var perspective = -(pos[0] - document.querySelector('#street-section-outer').scrollLeft - (system.viewportWidth / 2))
    // TODO const
    // TODO cross-browser

    el.style.webkitPerspectiveOrigin = (perspective / 2) + 'px 50%'
    el.style.MozPerspectiveOrigin = (perspective / 2) + 'px 50%'
    el.style.perspectiveOrigin = (perspective / 2) + 'px 50%'

    el.classList.add('switching-in-post')
  }, SEGMENT_SWITCHING_TIME / 2)

  window.setTimeout(function () {
    el.classList.remove('switching-in-pre')
    el.classList.remove('switching-in-post')
  }, SEGMENT_SWITCHING_TIME * 1.5)
}

export function switchSegmentElAway (el) {
  var pos = getElAbsolutePos(el)

  // TODO func
  var perspective = -(pos[0] - document.querySelector('#street-section-outer').scrollLeft - (system.viewportWidth / 2))
  // TODO const
  // TODO cross-browser

  el.style.webkitPerspectiveOrigin = (perspective / 2) + 'px 50%'
  el.style.MozPerspectiveOrigin = (perspective / 2) + 'px 50%'
  el.style.perspectiveOrigin = (perspective / 2) + 'px 50%'

  el.parentNode.removeChild(el)
  el.classList.remove('hover')
  el.classList.add('switching-away-pre')
  el.style.left = (pos[0] - document.querySelector('#street-section-outer').scrollLeft) + 'px'
  el.style.top = pos[1] + 'px'
  document.body.appendChild(el)

  window.setTimeout(function () {
    el.classList.add('switching-away-post')
  }, 0)

  window.setTimeout(function () {
    el.remove()
  }, SEGMENT_SWITCHING_TIME)
}

function hideEmptySegment (position) {
  document.querySelector('#street-section-' + position + '-empty-space')
    .classList.remove('visible')
}

function showEmptySegment (position, width) {
  document.querySelector('#street-section-' + position + '-empty-space .width').innerHTML =
    prettifyWidth(width / TILE_SIZE, { markup: true })
  document.querySelector('#street-section-' + position + '-empty-space')
    .classList.add('visible')

  if (position === 'right') {
    width-- // So that the rules align
  }
  document.querySelector('#street-section-' + position + '-empty-space')
    .style.width = width + 'px'
}

function repositionEmptySegments () {
  let width
  let street = getStreet()
  if (street.remainingWidth <= 0) {
    hideEmptySegment('left')
    hideEmptySegment('right')
  } else {
    if (!street.occupiedWidth) {
      width = street.remainingWidth * TILE_SIZE
      showEmptySegment('left', width)
      hideEmptySegment('right')
    } else {
      width = street.remainingWidth / 2 * TILE_SIZE
      showEmptySegment('left', width)
      showEmptySegment('right', width)
    }
  }
}

export function segmentsChanged () {
  if (!getInitializing()) {
    createDataFromDom()
  }

  recalculateWidth()
  repositionEmptySegments()
  applyWarningsToSegments()

  let street = getStreet()
  for (var i in street.segments) {
    if (street.segments[i].el) {
      street.segments[i].el.dataNo = i
    }
  }

  saveStreetToServerIfNecessary()
  updateUndoButtons()
  repositionSegments()
}

function onSegmentMouseEnter (event) {
  if (suppressMouseEnter()) {
    return
  }

  infoBubble.considerShowing(event, this, INFO_BUBBLE_TYPE_SEGMENT)
}

function onSegmentMouseLeave () {
  infoBubble.dontConsiderShowing()
}
