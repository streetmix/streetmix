import { images } from '../app/load_resources'
import { formatMessage } from '../locales/locale'
import { saveStreetToServerIfNecessary } from '../streets/data_model'
import { recalculateWidth } from '../streets/width'
import { getSegmentInfo, getSegmentVariantInfo, getSpriteDef } from './info'
import { drawScatteredSprites } from './scatter'
import {
  TILE_SIZE,
  TILESET_POINT_PER_PIXEL,
  TILE_SIZE_ACTUAL,
  MAX_SEGMENT_LABEL_LENGTH,
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from './constants'
import store from '../store'
import { updateSegments, changeSegmentProperties } from '../store/slices/street'
import PEOPLE from './people.json'

// Adjust spacing between people to be slightly closer
const PERSON_SPACING_ADJUSTMENT = -0.5 // in feet
const PERSON_SPRITE_OFFSET_Y = 10 // in pixels

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
export function drawSegmentImage (
  id,
  ctx,
  sx = 0,
  sy = 0,
  sw,
  sh,
  dx,
  dy,
  dw,
  dh,
  multiplier = 1,
  dpi
) {
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
  sw = sw === undefined ? svg.width : sw * TILESET_POINT_PER_PIXEL
  sh = sh === undefined ? svg.height : sh * TILESET_POINT_PER_PIXEL

  // We can't read `.naturalWidth` and `.naturalHeight` properties from
  // the image in IE11, which returns 0. This is why width and height are
  // stored as properties from when the image is first cached
  // All images are drawn at 2x pixel dimensions so divide in half to get
  // actual width / height value then multiply by system pixel density
  //
  // dw/dh (and later sw/sh) can be 0, so don't use falsy checks
  dw = dw === undefined ? svg.width / TILESET_POINT_PER_PIXEL : dw
  dh = dh === undefined ? svg.height / TILESET_POINT_PER_PIXEL : dh
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
      console.error(
        'drawImage failed for img id ' +
          id +
          ' with error: ' +
          e +
          ' - Retrying after 2 seconds'
      )
      ctx.drawImage(svg.img, sx, sy, sw, sh, dx, dy, dw, dh)
    }, 2000)
  }
}

/**
 * When rendering a stack of sprites, sometimes the resulting image will extend
 * beyond the left or right edge of the segment's width. (For instance, a
 * "tree" segment might be 0.5m wide, but the actual width of the tree sprite
 * will need more than 0.5m width to render.) This calculates the actual left,
 * right, and center Y-values needed to render sprites so that they are not
 * truncated at the edge of the segment.
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
    const sprites = Array.isArray(graphics.center)
      ? graphics.center
      : [graphics.center]

    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)

      // If svg is missing, let it not affect this calculation
      if (svg) {
        newLeft = center - svg.width / 2 + (sprite.offsetX || 0)
        newRight = center + svg.width / 2 + (sprite.offsetX || 0)

        if (newLeft < left) {
          left = newLeft
        }
        if (newRight > right) {
          right = newRight
        }
      }
    }
  }

  if (graphics.left) {
    const sprites = Array.isArray(graphics.left)
      ? graphics.left
      : [graphics.left]

    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)

      if (svg) {
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
  }

  if (graphics.right) {
    const sprites = Array.isArray(graphics.right)
      ? graphics.right
      : [graphics.right]

    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)

      if (svg) {
        newLeft = displayWidth - (sprite.offsetX || 0) - svg.width
        newRight = displayWidth - (sprite.offsetX || 0)

        if (newLeft < left) {
          left = newLeft
        }
        if (newRight > right) {
          right = newRight
        }
      }
    }
  }

  if (graphics.repeat && graphics.repeat[0]) {
    newLeft = center - displayWidth / 2
    newRight = center + displayWidth / 2

    if (newLeft < left) {
      left = newLeft
    }
    if (newRight > right) {
      right = newRight
    }
  }

  return {
    left: left / TILE_SIZE_ACTUAL,
    right: right / TILE_SIZE_ACTUAL,
    center: center / TILE_SIZE_ACTUAL
  }
}

const GROUND_LEVEL_OFFSETY = {
  ASPHALT: 0,
  CURB: 14,
  RAISED_CURB: 74
}

/**
 * Originally a sprite's dy position was calculated using: dy = offsetTop +
 * (multiplier * TILE_SIZE * (sprite.offsetY || 0)). In order to remove
 * `offsetY` from `SPRITE_DEF`, we are defining the `offsetY` for all "ground",
 * or "lane", sprites in pixels in `GROUND_LEVEL_OFFSETY`. This was calculated
 * by taking the difference of the `offsetY` value for ground level 0 and the
 * `offsetY` for the elevation of the current segment. Using `elevation`, which
 * is defined for each segment based on the "ground" component being used, this
 * function returns the `GROUND_LEVEL_OFFSETY` for that `elevation`. If not
 * found, it returns null.
 *
 * @param {Number} elevation
 * @returns {?Number} groundLevelOffset
 */
function getGroundLevelOffset (elevation) {
  switch (elevation) {
    case 0:
      return GROUND_LEVEL_OFFSETY.ASPHALT
    case 1:
      return GROUND_LEVEL_OFFSETY.CURB
    case 2:
      return GROUND_LEVEL_OFFSETY.RAISED_CURB
    default:
      return null
  }
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} type
 * @param {string} variantString
 * @param {Number} actualWidth - The real-world width of a segment, in feet
 * @param {Number} offsetLeft
 * @param {Number} groundBaseline
 * @param {Number} randSeed
 * @param {Number} multiplier
 * @param {Number} dpi
 * @param {Number} drawSegmentOnly - If true, skips drawing background elements
 */
export function drawSegmentContents (
  ctx,
  type,
  variantString,
  actualWidth,
  offsetLeft,
  groundBaseline,
  randSeed,
  multiplier,
  dpi,
  drawSegmentOnly = false
) {
  const variantInfo = getSegmentVariantInfo(type, variantString)
  const graphics = variantInfo.graphics

  // TODO: refactor this variable
  const segmentWidth = actualWidth * TILE_SIZE

  const dimensions = getVariantInfoDimensions(variantInfo, actualWidth)
  const left = dimensions.left

  const groundLevelOffset = getGroundLevelOffset(variantInfo.elevation)
  const groundLevel =
    groundBaseline -
    multiplier * TILE_SIZE * (groundLevelOffset / TILE_SIZE_ACTUAL || 0)

  if (graphics.repeat && !drawSegmentOnly) {
    // Convert single string or object values to single-item array
    let sprites = Array.isArray(graphics.repeat)
      ? graphics.repeat
      : [graphics.repeat]
    if (drawSegmentOnly) {
      sprites = [sprites[sprites.length - 1]]
    }
    // Convert array of strings into array of objects
    // If already an object, pass through
    sprites = sprites.map((def) =>
      typeof def === 'string' ? { id: def } : def
    )

    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l].id)
      const svg = images.get(sprite.id)

      // Skip drawing if sprite is missing
      if (!svg) continue

      let width = (svg.width / TILE_SIZE_ACTUAL) * TILE_SIZE
      const padding = sprites[l].padding ?? 0
      const drawWidth = segmentWidth - padding * TILE_SIZE * 2
      const count = Math.floor(drawWidth / width) + 1
      let repeatStartX

      if (left < 0) {
        repeatStartX = -left * TILE_SIZE
      } else {
        repeatStartX = 0
      }

      // The distance between the top of the sprite and the ground is calculated by subtracting the height of the sprite with the # of pixels
      // to get to the point of the sprite which should align with the ground.
      const distanceFromGround =
        multiplier *
        TILE_SIZE *
        ((svg.height - (sprite.originY || 0)) / TILE_SIZE_ACTUAL)

      for (let i = 0; i < count; i++) {
        // remainder
        if (i === count - 1) {
          width = drawWidth - (count - 1) * width
        }

        // If the sprite being rendered is the ground, dy is equal to the groundLevel. If not, dy is equal to the groundLevel minus the distance
        // the sprite will be from the ground.
        drawSegmentImage(
          sprite.id,
          ctx,
          undefined,
          undefined,
          width,
          undefined,
          offsetLeft +
            padding * TILE_SIZE * multiplier +
            (repeatStartX + i * (svg.width / TILE_SIZE_ACTUAL) * TILE_SIZE) *
              multiplier,
          sprite.id.includes('ground')
            ? groundLevel
            : groundLevel - distanceFromGround,
          width,
          undefined,
          multiplier,
          dpi
        )
      }
    }
  }

  if (graphics.left) {
    let sprites = Array.isArray(graphics.left) ? graphics.left : [graphics.left]
    if (drawSegmentOnly) {
      sprites = [sprites[sprites.length - 1]]
    }
    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)

      // Skip drawing if sprite is missing
      if (!svg) continue

      const x =
        0 +
        (-left + (sprite.offsetX / TILE_SIZE_ACTUAL || 0)) *
          TILE_SIZE *
          multiplier
      const distanceFromGround =
        multiplier *
        TILE_SIZE *
        ((svg.height - (sprite.originY || 0)) / TILE_SIZE_ACTUAL)

      drawSegmentImage(
        sprite.id,
        ctx,
        undefined,
        undefined,
        undefined,
        undefined,
        offsetLeft + x,
        groundLevel - distanceFromGround,
        undefined,
        undefined,
        multiplier,
        dpi
      )
    }
  }

  if (graphics.right) {
    let sprites = Array.isArray(graphics.right)
      ? graphics.right
      : [graphics.right]
    if (drawSegmentOnly) {
      sprites = [sprites[sprites.length - 1]]
    }
    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)

      // Skip drawing if sprite is missing
      if (!svg) continue

      const x =
        (-left +
          actualWidth -
          svg.width / TILE_SIZE_ACTUAL -
          (sprite.offsetX / TILE_SIZE_ACTUAL || 0)) *
        TILE_SIZE *
        multiplier
      const distanceFromGround =
        multiplier *
        TILE_SIZE *
        ((svg.height - (sprite.originY || 0)) / TILE_SIZE_ACTUAL)

      drawSegmentImage(
        sprite.id,
        ctx,
        undefined,
        undefined,
        undefined,
        undefined,
        offsetLeft + x,
        groundLevel - distanceFromGround,
        undefined,
        undefined,
        multiplier,
        dpi
      )
    }
  }

  if (graphics.center) {
    let sprites = Array.isArray(graphics.center)
      ? graphics.center
      : [graphics.center]
    if (drawSegmentOnly) {
      sprites = [sprites[sprites.length - 1]]
    }
    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)

      // Skip drawing if sprite is missing
      if (!svg) continue

      const center = dimensions.center
      const x =
        (center -
          svg.width / TILE_SIZE_ACTUAL / 2 -
          left -
          (sprite.offsetX / TILE_SIZE_ACTUAL || 0)) *
        TILE_SIZE *
        multiplier
      const distanceFromGround =
        multiplier *
        TILE_SIZE *
        ((svg.height - (sprite.originY || 0)) / TILE_SIZE_ACTUAL)

      drawSegmentImage(
        sprite.id,
        ctx,
        undefined,
        undefined,
        undefined,
        undefined,
        offsetLeft + x,
        groundLevel - distanceFromGround,
        undefined,
        undefined,
        multiplier,
        dpi
      )
    }
  }

  // Draw items that are scattered from a pool of assets
  // Only used for random people generation right now
  if (graphics.scatter) {
    if (graphics.scatter.pool === 'people') {
      const originY =
        (graphics.scatter.originY ??
          graphics.scatter.originY + PERSON_SPRITE_OFFSET_Y) ||
        PERSON_SPRITE_OFFSET_Y
      const people = PEOPLE.map((person) => {
        return {
          ...person,
          id: `people--${person.id}`,
          originY
        }
      })

      drawScatteredSprites(
        people,
        ctx,
        actualWidth,
        offsetLeft - left * TILE_SIZE * multiplier,
        groundLevel,
        randSeed,
        graphics.scatter.minSpacing,
        graphics.scatter.maxSpacing,
        PERSON_SPACING_ADJUSTMENT,
        graphics.scatter.padding,
        multiplier,
        dpi
      )
    }

    if (graphics.scatter.sprites) {
      drawScatteredSprites(
        graphics.scatter.sprites,
        ctx,
        actualWidth,
        offsetLeft - left * TILE_SIZE * multiplier,
        groundLevel,
        randSeed ?? 9123984, // self defined randSeed if one is not provided.
        graphics.scatter.minSpacing,
        graphics.scatter.maxSpacing,
        0,
        graphics.scatter.padding,
        multiplier,
        dpi
      )
    }
  }
}

export function getLocaleSegmentName (type, variantString) {
  const segmentInfo = getSegmentInfo(type)
  const variantInfo = getSegmentVariantInfo(type, variantString)
  const defaultName = variantInfo.name || segmentInfo.name
  const nameKey = variantInfo.nameKey || segmentInfo.nameKey
  const key = `segments.${nameKey}`

  return formatMessage(key, defaultName, { ns: 'segment-info' })
}

/**
 * TODO: remove this
 */
export function segmentsChanged () {
  const street = store.getState().street
  const updatedStreet = recalculateWidth(street)

  store.dispatch(
    updateSegments(
      updatedStreet.segments,
      updatedStreet.occupiedWidth,
      updatedStreet.remainingWidth
    )
  )

  saveStreetToServerIfNecessary()
}

/**
 * Process / sanitize segment labels
 *
 * @params {string} name - Segment label to check
 * @returns {string} - normalized / sanitized segment label
 */
function normalizeSegmentLabel (label) {
  if (!label) return ''

  label = label.trim()

  if (label.length > MAX_SEGMENT_LABEL_LENGTH) {
    label = label.substr(0, MAX_SEGMENT_LABEL_LENGTH) + '…'
  }

  return label
}

/**
 * Uses browser prompt to change the segment label
 *
 * @param {Object} segment - object describing the segment to edit
 * @param {Number} position - index of segment to edit
 */
export function editSegmentLabel (segment, position) {
  const prevLabel =
    segment.label || getLocaleSegmentName(segment.type, segment.variantString)
  const label = normalizeSegmentLabel(
    window.prompt(
      formatMessage('prompt.segment-label', 'New segment label:'),
      prevLabel
    )
  )

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
  if (position === BUILDING_LEFT_POSITION) {
    segmentEl = document.querySelectorAll('.street-section-building')[0]
  } else if (position === BUILDING_RIGHT_POSITION) {
    segmentEl = document.querySelectorAll('.street-section-building')[1]
  } else {
    const segments = document
      .getElementById('street-section-editable')
      .querySelectorAll('.segment')
    segmentEl = segments[position]
  }
  return segmentEl
}
