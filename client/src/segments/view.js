import { percentToNumber } from '@streetmix/utils'

import { images } from '../app/load_resources'
import { formatMessage } from '../locales/locale'
import { saveStreetToServerIfNecessary } from '../streets/data_model'
import { recalculateWidth } from '../streets/width'
import store from '../store'
import { updateSegments, changeSegmentProperties } from '../store/slices/street'
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
import PEOPLE from './people.yaml'

// Adjust spacing between people to be slightly closer
const PERSON_SPACING_ADJUSTMENT = -0.1 // in meters
const PERSON_SPRITE_OFFSET_Y = 10 // in pixels

/**
 * Draws SVG sprite to canvas
 *
 * @param {string} id - identifier of sprite
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} sx - x position of sprite to read from (default = 0)
 * @param {Number} sy - y position of sprite to read from (default = 0)
 * @param {Number|undefined} sw - sub-rectangle width to draw
 * @param {Number|undefined} sh - sub-rectangle height to draw
 * @param {Number} dx - x position on canvas
 * @param {Number} dy - y position on canvas
 * @param {Number|undefined} dw - destination width to draw
 * @param {Number|undefined} dh - destination height to draw
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

  // Round all values to whole numbers when we render. Decimal values can
  // introduce tiny "seams" at tiled assets, for example.
  ctx.drawImage(
    svg.img,
    Math.round(sx),
    Math.round(sy),
    Math.round(sw),
    Math.round(sh),
    Math.round(dx),
    Math.round(dy),
    // destination sprites round up to prevent gaps in tiled sprites
    Math.ceil(dw),
    Math.ceil(dh)
  )
}

/**
 * When rendering a stack of sprites, sometimes the resulting image will extend
 * beyond the left or right edge of the segment's width. (For instance, a
 * "tree" segment might be 0.5m wide, but the actual width of the tree sprite
 * will need more than 0.5m width to render.) This calculates the actual left,
 * right, and center Y-values needed to render sprites so that they are not
 * truncated at the edge of the segment.
 *
 * @param {VariantInfo} variantInfo - segment variant info
 * @param {Number} actualWidth - segment's actual real life width
 * @returns {VariantInfoDimensions}
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

  // If a segment has a "minimum renderable width", the left and right values
  // are overridden based on the `quirks.minWidth` property. This prevents
  // left/right assets from rendering in strange positions.
  if (graphics.quirks?.minWidth) {
    const minDimension = graphics.quirks.minWidth * TILE_SIZE_ACTUAL
    if (displayWidth < minDimension) {
      left = (displayWidth - minDimension) / 2
      right = (minDimension - displayWidth) / 2 + displayWidth
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
  CURB: 18,
  RAISED_CURB: 94,
  DRAINAGE: -50
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
    case -2:
      return GROUND_LEVEL_OFFSETY.DRAINAGE
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
 * @param {Number} actualWidth - The real-world width of a segment, in meters
 * @param {Number} offsetLeft
 * @param {Number} groundBaseline
 * @param {string} randSeed
 * @param {Number} multiplier
 * @param {Number} dpi
 */
export function drawSegmentContents (
  ctx,
  type,
  variantString,
  actualWidth,
  offsetLeft,
  groundBaseline,
  elevation = 0,
  randSeed,
  multiplier,
  dpi
) {
  const variantInfo = getSegmentVariantInfo(type, variantString)
  const graphics = variantInfo.graphics

  // TODO: refactor this variable
  const segmentWidth = actualWidth * TILE_SIZE

  const dimensions = getVariantInfoDimensions(variantInfo, actualWidth)
  const left = dimensions.left
  const minWidthQuirk = graphics.quirks?.minWidth

  const groundLevelOffset = getGroundLevelOffset(elevation)
  const groundLevel =
    groundBaseline -
    multiplier * (groundLevelOffset / TILESET_POINT_PER_PIXEL || 0)

  if (graphics.repeat) {
    // Convert single string or object values to single-item array
    let sprites = Array.isArray(graphics.repeat)
      ? graphics.repeat
      : [graphics.repeat]
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

      let drawWidth
      // If quirks.minWidth is defined, and the segment width is less than that
      // value, then the draw width is the minimum renderable width, not the
      // segment width. Skip this for ground assets.
      if (
        minWidthQuirk &&
        actualWidth < minWidthQuirk &&
        !sprite.id.includes('ground')
      ) {
        drawWidth = minWidthQuirk * TILE_SIZE - padding * 2 * TILE_SIZE
      } else {
        drawWidth = segmentWidth - padding * 2 * TILE_SIZE
      }

      const countX = Math.floor(drawWidth / width) + 1

      let repeatStartX
      if (left < 0) {
        // If quirks.minWidth is defined, and the segment width is less than
        // that value, then render the left edge at minimum width boundary,
        // don't reposition it along the segment's left edge. Skip this process
        // if it's a ground asset.
        if (
          minWidthQuirk &&
          actualWidth < minWidthQuirk &&
          !sprite.id.includes('ground')
        ) {
          repeatStartX = 0
        } else {
          // This is for rendering beyond the left edge of the segment
          repeatStartX = -left * TILE_SIZE
        }
      } else {
        // This is the normal render logic.
        repeatStartX = 0
      }

      // The distance between the top of the sprite and the ground is
      // calculated by subtracting the height of the sprite with the # of
      // pixels to get to the point of the sprite which should align with
      // the ground.
      const distanceFromGround =
        multiplier *
        TILE_SIZE *
        ((svg.height - (sprite.originY || 0)) / TILE_SIZE_ACTUAL)

      // Right now only ground items repeat in the Y direction
      const height = (svg.height / TILE_SIZE_ACTUAL) * TILE_SIZE
      // countY should always be at minimum 1.
      const countY = sprite.id.startsWith('ground--')
        ? Math.ceil((ctx.canvas.height / dpi - groundLevel) / height)
        : 1

      for (let i = 0; i < countX; i++) {
        // remainder
        if (i === countX - 1) {
          width = drawWidth - (countX - 1) * width
        }

        for (let j = 0; j < countY; j++) {
          // If the sprite being rendered is the ground, dy is equal to the
          // groundLevel. If not, dy is equal to the groundLevel minus the
          // distance the sprite will be from the ground.
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
            sprite.id.startsWith('ground--')
              ? groundLevel + height * j
              : groundLevel - distanceFromGround,
            width,
            undefined,
            multiplier,
            dpi
          )
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

      // Skip drawing if sprite is missing
      if (!svg) continue

      let x
      // If quirks.minWidth is defined, and the segment width is less than that
      // value, then render a left-aligned asset at minimum width boundary,
      // don't reposition it along the segment's left edge.
      // Note: this doesn't take into account the sprite.offsetX because no
      // asset with quirks.minWidth has offsetX defined right now.
      if (minWidthQuirk && actualWidth < minWidthQuirk) {
        x = 0
      } else {
        // This is the normal render logic.
        x =
          0 +
          (-left + (sprite.offsetX / TILE_SIZE_ACTUAL || 0)) *
            TILE_SIZE *
            multiplier
      }

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
    const sprites = Array.isArray(graphics.right)
      ? graphics.right
      : [graphics.right]
    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)

      // Skip drawing if sprite is missing
      if (!svg) continue

      let x
      // If quirks.minWidth is defined, and the segment width is less than that
      // value, then render a right-aligned asset at minimum width boundary,
      // don't reposition it along the segment's right edge.
      // Note: this doesn't take into account the sprite.offsetX because no
      // asset with quirks.minWidth has offsetX defined right now.
      if (minWidthQuirk && actualWidth < minWidthQuirk) {
        x =
          (minWidthQuirk - svg.width / TILE_SIZE_ACTUAL) *
          TILE_SIZE *
          multiplier
      } else {
        // This is the normal render logic.
        x =
          (-left +
            actualWidth -
            svg.width / TILE_SIZE_ACTUAL -
            (sprite.offsetX / TILE_SIZE_ACTUAL || 0)) *
          TILE_SIZE *
          multiplier
      }

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
    const sprites = Array.isArray(graphics.center)
      ? graphics.center
      : [graphics.center]
    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)

      // Skip drawing if sprite is missing
      if (!svg) continue

      const center = dimensions.center
      const offsetByPercentage =
        sprite.offsetX &&
        typeof sprite.offsetX === 'string' &&
        sprite.offsetX.endsWith('%')
      const offsetX = offsetByPercentage ? 0 : sprite.offsetX
      const x =
        (center -
          svg.width / TILE_SIZE_ACTUAL / 2 -
          left -
          (offsetByPercentage ? percentToNumber(sprite.offsetX) * center : 0) -
          (offsetX / TILE_SIZE_ACTUAL || 0)) *
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

      // Convert sprite ids to the actual format they're in
      const people = PEOPLE.map((person) => {
        const obj = {
          ...person,
          id: `people--${person.id}`,
          originY
        }
        if (person.alts && person.alts.length > 0) {
          obj.alts = person.alts?.map((s) => `people--${s}`)
        }
        return obj
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
        randSeed,
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
  const defaultName = variantInfo.name ?? segmentInfo.name
  const nameKey = variantInfo.nameKey ?? segmentInfo.nameKey
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
 * @param {Segment} segment - object describing the segment to edit
 * @param {Number | BoundaryPosition} position - index of segment to edit
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
 *              the `segmentIndex` or `position` variables.
 * @returns {HTMLElement}
 */
export function getSegmentEl (position) {
  if (!position && position !== 0) return

  let segmentEl
  if (position === BUILDING_LEFT_POSITION) {
    segmentEl = document.querySelectorAll('.street-section-boundary')[0]
  } else if (position === BUILDING_RIGHT_POSITION) {
    segmentEl = document.querySelectorAll('.street-section-boundary')[1]
  } else {
    const segments = document
      .getElementById('street-section-editable')
      .querySelectorAll('.segment')
    segmentEl = segments[position]
  }
  return segmentEl
}
