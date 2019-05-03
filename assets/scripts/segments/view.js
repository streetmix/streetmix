import { images } from '../app/load_resources'
import { t } from '../locales/locale'
import { saveStreetToServerIfNecessary } from '../streets/data_model'
import { recalculateWidth } from '../streets/width'
import { getSegmentInfo, getSegmentVariantInfo, getSpriteDef } from './info'
import { drawProgrammaticPeople } from './people'
import { TILE_SIZE, TILESET_POINT_PER_PIXEL, TILE_SIZE_ACTUAL } from './constants'
import store from '../store'
import { updateSegments, changeSegmentProperties } from '../store/actions/street'

/**
 * Draws SVG sprite to canvas
 *
 * @param {string} id - identifier of sprite
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} sx - x position of sprite to read from (default = 0)
 * @param {Number} sy - y position of sprite to read from (default = 0)
 * @param {Number} sw - sub-rectangle width to draw
 * @param {Number} sh - sub-rectangle height to draw
 * @param {Number} dx - x position on canvas
 * @param {Number} dy - y position on canvas
 * @param {Number} dw - destination width to draw
 * @param {Number} dh - destination height to draw
 * @param {Number} multiplier - scale to draw at (default = 1)
 * @param {Number} dpi
 */
export function drawSegmentImage (id, ctx, sx = 0, sy = 0, sw, sh, dx, dy, dw, dh, multiplier = 1, dpi) {
  // If asked to render a source or destination image with width or height
  // that is equal to or less than 0, bail. Attempting to render such an image
  // will throw an IndexSizeError error in Firefox.
  if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return

  // Settings
  const state = store.getState()
  dpi = dpi || state.system.devicePixelRatio || 1
  const debugRect = state.flags.DEBUG_SEGMENT_CANVAS_RECTANGLES.value || false

  // Get image definition
  const svg = images.get(id)

  // Source width and height is based off of intrinsic image width and height,
  // but it can be overridden in the parameters, e.g. when repeating sprites
  // in a sequence and the last sprite needs to be truncated
  sw = (sw === undefined) ? svg.width : sw * TILESET_POINT_PER_PIXEL
  sh = (sh === undefined) ? svg.height : sh * TILESET_POINT_PER_PIXEL

  // We can't read `.naturalWidth` and `.naturalHeight` properties from
  // the image in IE11, which returns 0. This is why width and height are
  // stored as properties from when the image is first cached
  // All images are drawn at 2x pixel dimensions so divide in half to get
  // actual width / height value then multiply by system pixel density
  //
  // dw/dh (and later sw/sh) can be 0, so don't use falsy checks
  dw = (dw === undefined) ? svg.width / TILESET_POINT_PER_PIXEL : dw
  dh = (dh === undefined) ? svg.height / TILESET_POINT_PER_PIXEL : dh
  dw *= multiplier * dpi
  dh *= multiplier * dpi

  // Set render dimensions based on pixel density
  dx *= dpi
  dy *= dpi

  // These rectangles are telling us that we're drawing at the right places.
  if (debugRect === true) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillRect(dx, dy, dw, dh)
  }

  try {
    ctx.drawImage(svg.img, sx, sy, sw, sh, dx, dy, dw, dh)
  } catch (e) {
    // IE11 has some issues drawing SVG images soon after loading. https://stackoverflow.com/questions/25214395/unexpected-call-to-method-or-property-access-while-drawing-svg-image-onto-canvas
    setTimeout(() => {
      console.error('drawImage failed for img id ' + id + ' with error: ' + e + ' - Retrying after 2 seconds')
      ctx.drawImage(svg.img, sx, sy, sw, sh, dx, dy, dw, dh)
    }, 2000)
  }
}

/**
 * When rendering a stack of sprites, sometimes the resulting image will extend
 * beyond the left or right edge of the segment's width. (For instance, a "tree"
 * segment might be 0.5m wide, but the actual width of the tree sprite will need
 * more than 0.5m width to render.) This calculates the actual left, right, and
 * center Y-values needed to render sprites so that they are not truncated at the
 * edge of the segment.
 *
 * @param {Object} variantInfo - segment variant info
 * @param {Number} actualWidth - segment's actual real life width
 * @returns {Object}
 */
export function getVariantInfoDimensions (variantInfo, actualWidth = 0) {
  // Convert actualWidth to units that work with images' intrinsic dimensions
  const displayWidth = actualWidth * TILE_SIZE_ACTUAL

  const center = displayWidth / 2
  let left = center
  let right = center
  let newLeft, newRight

  const graphics = variantInfo.graphics

  if (graphics.center) {
    const sprites = Array.isArray(graphics.center) ? graphics.center : [graphics.center]

    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)

      newLeft = center - (svg.width / 2) + (sprite.offsetX || 0)
      newRight = center + (svg.width / 2) + (sprite.offsetX || 0)

      if (newLeft < left) {
        left = newLeft
      }
      if (newRight > right) {
        right = newRight
      }
    }
  }

  if (graphics.left) {
    const sprites = Array.isArray(graphics.left) ? graphics.left : [graphics.left]

    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)

      newLeft = sprite.offsetX || 0
      newRight = svg.width + (sprite.offsetX || 0)

      if (newLeft < left) {
        left = newLeft
      }
      if (newRight > right) {
        right = newRight
      }
    }
  }

  if (graphics.right) {
    const sprites = Array.isArray(graphics.right) ? graphics.right : [graphics.right]

    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)

      newLeft = (displayWidth) - (sprite.offsetX || 0) - svg.width
      newRight = (displayWidth) - (sprite.offsetX || 0)

      if (newLeft < left) {
        left = newLeft
      }
      if (newRight > right) {
        right = newRight
      }
    }
  }

  if (graphics.repeat && graphics.repeat[0]) {
    newLeft = center - (displayWidth / 2)
    newRight = center + (displayWidth / 2)

    if (newLeft < left) {
      left = newLeft
    }
    if (newRight > right) {
      right = newRight
    }
  }

  return { left: left / TILE_SIZE_ACTUAL, right: right / TILE_SIZE_ACTUAL, center: center / TILE_SIZE_ACTUAL }
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} type
 * @param {string} variantString
 * @param {Number} actualWidth - The real-world width of a segment, in feet
 * @param {Number} offsetLeft
 * @param {Number} offsetTop
 * @param {Number} randSeed
 * @param {Number} multiplier
 * @param {Number} dpi
 */
export function drawSegmentContents (ctx, type, variantString, actualWidth, offsetLeft, offsetTop, randSeed, multiplier, dpi) {
  const variantInfo = getSegmentVariantInfo(type, variantString)
  const graphics = variantInfo.graphics

  // TODO: refactor this variable
  const segmentWidth = actualWidth * TILE_SIZE

  const dimensions = getVariantInfoDimensions(variantInfo, actualWidth)
  const left = dimensions.left

  if (graphics.repeat) {
    const sprites = Array.isArray(graphics.repeat) ? graphics.repeat : [graphics.repeat]

    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)

      let width = (svg.width / TILE_SIZE_ACTUAL) * TILE_SIZE
      const count = Math.floor((segmentWidth / (width * multiplier)) + 1)
      let repeatStartX

      if (left < 0) {
        repeatStartX = -left * TILE_SIZE
      } else {
        repeatStartX = 0
      }

      for (let i = 0; i < count; i++) {
        // remainder
        if (i === count - 1) {
          width = (segmentWidth / multiplier) - ((count - 1) * width)
        }

        drawSegmentImage(sprite.id, ctx, undefined, undefined, width, undefined,
          offsetLeft + ((repeatStartX + (i * (svg.width / TILE_SIZE_ACTUAL) * TILE_SIZE)) * multiplier),
          offsetTop + (multiplier * TILE_SIZE * (sprite.offsetY || 0)),
          width, undefined, multiplier, dpi)
      }
    }
  }

  if (graphics.left) {
    const sprites = Array.isArray(graphics.left) ? graphics.left : [graphics.left]

    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const x = 0 + ((-left + (sprite.offsetX / TILE_SIZE_ACTUAL || 0)) * TILE_SIZE * multiplier)

      drawSegmentImage(sprite.id, ctx, undefined, undefined, undefined, undefined,
        offsetLeft + x,
        offsetTop + (multiplier * TILE_SIZE * (sprite.offsetY || 0)),
        undefined, undefined, multiplier, dpi)
    }
  }

  if (graphics.right) {
    const sprites = Array.isArray(graphics.right) ? graphics.right : [graphics.right]

    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)
      const x = (-left + actualWidth - (svg.width / TILE_SIZE_ACTUAL) - (sprite.offsetX / TILE_SIZE_ACTUAL || 0)) * TILE_SIZE * multiplier

      drawSegmentImage(sprite.id, ctx, undefined, undefined, undefined, undefined,
        offsetLeft + x,
        offsetTop + (multiplier * TILE_SIZE * (sprite.offsetY || 0)),
        undefined, undefined, multiplier, dpi)
    }
  }

  if (graphics.center) {
    const sprites = Array.isArray(graphics.center) ? graphics.center : [graphics.center]

    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)
      const center = dimensions.center
      const x = (center - ((svg.width / TILE_SIZE_ACTUAL) / 2) - left - (sprite.offsetX / TILE_SIZE_ACTUAL || 0)) * TILE_SIZE * multiplier

      drawSegmentImage(sprite.id, ctx, undefined, undefined, undefined, undefined,
        offsetLeft + x,
        offsetTop + (multiplier * TILE_SIZE * (sprite.offsetY || 0)),
        undefined, undefined, multiplier, dpi)
    }
  }

  if (type === 'sidewalk') {
    drawProgrammaticPeople(ctx, segmentWidth / multiplier, offsetLeft - (left * TILE_SIZE * multiplier), offsetTop, randSeed, multiplier, variantString, dpi)
  }
}

export function getLocaleSegmentName (type, variantString) {
  const segmentInfo = getSegmentInfo(type)
  const variantInfo = getSegmentVariantInfo(type, variantString)
  const defaultName = variantInfo.name || segmentInfo.name
  const nameKey = variantInfo.nameKey || segmentInfo.nameKey
  const key = `segments.${nameKey}`

  return t(key, defaultName, { ns: 'segment-info' })
}

/**
 * TODO: remove this
 */
export function segmentsChanged () {
  const street = store.getState().street
  const updatedStreet = recalculateWidth(street)

  store.dispatch(updateSegments(updatedStreet.segments, updatedStreet.occupiedWidth, updatedStreet.remainingWidth))

  saveStreetToServerIfNecessary()
}

/**
 * Uses browser prompt to change the segment label
 *
 * @param {Object} segment - object describing the segment to edit
 * @param {Number} position - index of segment to edit
 */
export function editSegmentLabel (segment, position) {
  const prevLabel = segment.label || getLocaleSegmentName(segment.type, segment.variantString)
  const label = window.prompt(t('prompt.segment-label', 'New segment label:'), prevLabel)

  if (label && label !== prevLabel) {
    store.dispatch(changeSegmentProperties(position, { label }))
    segmentsChanged()
  }
}

/**
 * Given the position of a segment or building, retrieve a reference to its
 * DOM element.
 *
 * @param {Number|string} position - either "left" or "right" for building,
 *              or a number for the position of the segment. Should be
 *              the `dataNo` or `position` variables.
 */
export function getSegmentEl (position) {
  if (!position && position !== 0) return

  let segmentEl
  if (position === 'left') {
    segmentEl = document.querySelectorAll('.street-section-building')[0]
  } else if (position === 'right') {
    segmentEl = document.querySelectorAll('.street-section-building')[1]
  } else {
    const segments = document.getElementById('street-section-editable').querySelectorAll('.segment')
    segmentEl = segments[position]
  }
  return segmentEl
}
