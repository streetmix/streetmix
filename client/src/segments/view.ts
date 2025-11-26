import {
  getSegmentInfo,
  getSegmentVariantInfo,
  getSpriteDef,
} from '@streetmix/parts'
import { percentToNumber } from '@streetmix/utils'

import { images } from '../app/load_resources'
import { formatMessage } from '../locales/locale'
import { saveStreetToServerIfNecessary } from '../streets/data_model'
import { applyWarningsToSlices } from '../streets/warnings'
import { recalculateWidth } from '../streets/width'
import store from '../store'
import { updateSegments, changeSegmentProperties } from '../store/slices/street'
import { drawScatteredSprites } from './scatter'
import {
  TILE_SIZE,
  TILESET_POINT_PER_PIXEL,
  TILE_SIZE_ACTUAL,
  MAX_SEGMENT_LABEL_LENGTH,
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION,
  GROUND_BASELINE_HEIGHT,
} from './constants'
import PEOPLE from './people.yaml'

import type {
  BoundaryPosition,
  SlopeProperties,
  Segment,
  SpriteDefinition,
  UnknownVariantInfo,
  VariantInfo,
  VariantInfoDimensions,
} from '@streetmix/types'

// Adjust spacing between people to be slightly closer
const PERSON_SPACING_ADJUSTMENT = -0.1 // in meters
const PERSON_SPRITE_OFFSET_Y = 10 // in pixels

/**
 * Draws SVG sprite to canvas
 *
 * @param id - identifier of sprite
 * @param ctx
 * @param sx - x position of sprite to read from (default = 0)
 * @param sy - y position of sprite to read from (default = 0)
 * @param sw - sub-rectangle width to draw
 * @param sh - sub-rectangle height to draw
 * @param dx - x position on canvas
 * @param dy - y position on canvas
 * @param dw - destination width to draw
 * @param dh - destination height to draw
 * @param multiplier - scale to draw at (default = 1)
 * @param dpi
 */
export function drawSegmentImage(
  id: string,
  ctx: CanvasRenderingContext2D,
  sx: number = 0,
  sy: number = 0,
  sw: number | undefined,
  sh: number | undefined,
  dx: number,
  dy: number,
  dw: number | undefined,
  dh: number | undefined,
  multiplier: number = 1,
  dpi?: number
): void {
  // If asked to render a source or destination image with width or height
  // that is equal to or less than 0, bail. Attempting to render such an image
  // will throw an IndexSizeError error in Firefox.
  // If any of these values are undefined, the comparison evaluates to false.
  // So it's valid, even though it's a type error. Overridden with `!`
  if (sw! <= 0 || sh! <= 0 || dw! <= 0 || dh! <= 0) return

  // Settings
  const state = store.getState()
  dpi = dpi || state.system.devicePixelRatio || 1
  const debugRect = state.flags.DEBUG_SEGMENT_CANVAS_RECTANGLES.value || false

  // Get image definition
  const svg = images.get(id)
  // Source width and height is based off of intrinsic image width and height,
  // but it can be overridden in the parameters, e.g. when repeating sprites
  // in a sequence and the last sprite needs to be truncated
  sw = sw === undefined ? (svg.width as number) : sw * TILESET_POINT_PER_PIXEL
  sh = sh === undefined ? (svg.height as number) : sh * TILESET_POINT_PER_PIXEL

  // We can't read `.naturalWidth` and `.naturalHeight` properties from
  // the image in IE11, which returns 0. This is why width and height are
  // stored as properties from when the image is first cached
  // All images are drawn at 2x pixel dimensions so divide in half to get
  // actual width / height value then multiply by system pixel density
  //
  // dw/dh (and later sw/sh) can be 0, so don't use falsy checks
  dw = dw === undefined ? (svg.width as number) / TILESET_POINT_PER_PIXEL : dw
  dh = dh === undefined ? (svg.height as number) / TILESET_POINT_PER_PIXEL : dh
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
 * @param variantInfo - segment variant info
 * @param actualWidth - segment's actual real life width
 */
export function getVariantInfoDimensions(
  variantInfo: VariantInfo | UnknownVariantInfo,
  actualWidth: number = 0
): VariantInfoDimensions {
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
        // TODO: This doesn't take into account % offsets
        newLeft = center - svg.width / 2 - (sprite.offsetX ?? 0)
        newRight = center + svg.width / 2 + (sprite.offsetX ?? 0)

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
        newLeft = sprite.offsetX ?? 0
        newRight = svg.width + (sprite.offsetX ?? 0)

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
        newLeft = displayWidth - (sprite.offsetX ?? 0) - svg.width
        newRight = displayWidth - (sprite.offsetX ?? 0)

        if (newLeft < left) {
          left = newLeft
        }
        if (newRight > right) {
          right = newRight
        }
      }
    }
  }

  if (graphics.ground) {
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
    center: center / TILE_SIZE_ACTUAL,
  }
}

// Convert single string or object values to single-item array
function normalizeSpriteDefs(
  def: string | SpriteDefinition | SpriteDefinition[]
): SpriteDefinition[] {
  if (typeof def === 'string') {
    return [{ id: def }]
  } else if (Array.isArray(def)) {
    return def
  } else {
    return [def]
  }
}

/**
 * Given an elevation value (in meters), return the pixel height it should be
 * rendered at.
 *
 * @param elevation
 * @returns pixels
 */
export function getElevation(elevation: number): number {
  return elevation * TILE_SIZE
}

// Ground rendering helper functions
function getCanvasElevation(elev: number, scale: number): number {
  return (getElevation(elev) + GROUND_BASELINE_HEIGHT) * scale
}

function drawGroundPattern(
  ctx: CanvasRenderingContext2D,
  dw: number,
  dx: number,
  groundBaseline: number,
  elevation: number,
  slope: SlopeProperties,
  spriteId: string,
  multiplier: number = 1,
  dpi: number
): void {
  const spriteDef = getSpriteDef(spriteId)
  const spriteImage = images.get(spriteDef.id)
  const pattern = ctx.createPattern(spriteImage.img, 'repeat')
  if (!pattern) return

  // TODO: scale the pattern according to image scale
  // This will only be important if we have patterns that aren't solid colors
  // pattern.setTransform(new DOMMatrix().scale(1))

  // Adjust values for canvas scale
  dw *= multiplier * dpi

  // Set render dimensions based on pixel density
  dx *= dpi

  const ground = groundBaseline + GROUND_BASELINE_HEIGHT * multiplier

  // Save context state before drawing ground pattern
  ctx.save()

  // Handle slopes or flat ground
  // This also handles if slope.values is an empty array
  const leftElevation = slope.on ? (slope.values[0] ?? elevation) : elevation
  const rightElevation = slope.on ? (slope.values[1] ?? elevation) : elevation
  const leftCanvasValue = getCanvasElevation(leftElevation, multiplier)
  const rightCanvasValue = getCanvasElevation(rightElevation, multiplier)

  // Draw a shape representing the ground
  ctx.beginPath()
  // Bottom left
  ctx.moveTo(dx, ground * dpi)
  // Top left
  ctx.lineTo(dx, (ground - leftCanvasValue) * dpi)
  // Top right
  ctx.lineTo(dx + dw, (ground - rightCanvasValue) * dpi)
  // Bottom right
  ctx.lineTo(dx + dw, ground * dpi)
  ctx.closePath()

  // Clip our fill to this shape
  ctx.clip()

  // Then fill the clipped shape
  ctx.fillStyle = pattern
  ctx.fillRect(dx, 0, dx + dw, ground * dpi)

  // Restore context state
  ctx.restore()
}

/**
 *
 * @param ctx
 * @param type
 * @param variantString
 * @param actualWidth - The real-world width of a segment, in meters
 * @param offsetLeft
 * @param groundBaseline
 * @param randSeed
 * @param multiplier
 * @param dpi
 */
export function drawSegmentContents(
  ctx: CanvasRenderingContext2D,
  type: string,
  variantString: string,
  actualWidth: number,
  offsetLeft: number,
  groundBaseline: number,
  elevation: number,
  slope: SlopeProperties,
  randSeed: string,
  multiplier: number,
  dpi: number
): void {
  const variantInfo = getSegmentVariantInfo(type, variantString)
  const graphics = variantInfo.graphics

  // TODO: refactor this variable
  const segmentWidth = actualWidth * TILE_SIZE

  const dimensions = getVariantInfoDimensions(variantInfo, actualWidth)
  const left = dimensions.left
  const minWidthQuirk = graphics.quirks?.minWidth

  const groundLevelOffsetY = variantInfo.offsetY ?? 0
  const elevationValue = getElevation(elevation)
  const groundLevel =
    groundBaseline -
    multiplier * (groundLevelOffsetY / TILESET_POINT_PER_PIXEL) -
    multiplier * elevationValue

  const coastmixMode = store.getState().flags.COASTMIX_MODE.value

  if (graphics.ground) {
    const sprites = normalizeSpriteDefs(graphics.ground)

    // This technically supports multiple ground textures because it's the same
    // data structure as the other sprite definitions, but in practice you
    // would only render/see one texture.
    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)

      // Skip drawing if sprite is missing
      if (!svg) continue

      // For ground assets, use a shape and fill, skip the rest
      // Adjust left position because some slices have a left overhang
      const x = left < 0 ? -left * TILE_SIZE * multiplier : 0

      drawGroundPattern(
        ctx,
        segmentWidth,
        offsetLeft + x,
        groundBaseline,
        elevation,
        slope,
        sprite.id,
        multiplier,
        dpi
      )
    }
  }

  if (graphics.repeat) {
    const sprites = normalizeSpriteDefs(graphics.repeat)

    for (let l = 0; l < sprites.length; l++) {
      const sprite = getSpriteDef(sprites[l])
      const svg = images.get(sprite.id)

      // Skip drawing if sprite is missing
      if (!svg) continue

      let width = (svg.width / TILE_SIZE_ACTUAL) * TILE_SIZE
      const padding = sprites[l].padding ?? 0

      let drawWidth
      // If quirks.minWidth is defined, and the segment width is less than that
      // value, then the draw width is the minimum renderable width, not the
      // segment width.
      if (minWidthQuirk && actualWidth < minWidthQuirk) {
        drawWidth = minWidthQuirk * TILE_SIZE - padding * 2 * TILE_SIZE
      } else {
        drawWidth = segmentWidth - padding * 2 * TILE_SIZE
      }

      const countX = Math.floor(drawWidth / width) + 1

      let repeatStartX
      if (left < 0) {
        // If quirks.minWidth is defined, and the segment width is less than
        // that value, then render the left edge at minimum width boundary,
        // don't reposition it along the segment's left edge.
        if (minWidthQuirk && actualWidth < minWidthQuirk) {
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
        ((svg.height - (sprite.originY ?? 0) + (sprite.offsetY ?? 0)) /
          TILE_SIZE_ACTUAL)

      // Right now only ground items repeat in the Y direction
      const height = (svg.height / TILE_SIZE_ACTUAL) * TILE_SIZE

      // countY should always be at minimum 1.
      // TODO: apply this to assets that need to be repeated in Y
      // direction that are not ground (which are rendered using
      // different logic now) -- e.g. markings
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
    const sprites = normalizeSpriteDefs(graphics.left)

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
          (-left + (sprite.offsetX ?? 0) / TILE_SIZE_ACTUAL) *
            TILE_SIZE *
            multiplier
      }

      const distanceFromGround =
        multiplier *
        TILE_SIZE *
        ((svg.height - (sprite.originY ?? 0) + (sprite.offsetY ?? 0)) /
          TILE_SIZE_ACTUAL)

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
    const sprites = normalizeSpriteDefs(graphics.right)

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
            (sprite.offsetX ?? 0) / TILE_SIZE_ACTUAL) *
          TILE_SIZE *
          multiplier
      }

      const distanceFromGround =
        multiplier *
        TILE_SIZE *
        ((svg.height - (sprite.originY ?? 0) + (sprite.offsetY ?? 0)) /
          TILE_SIZE_ACTUAL)

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
    const sprites = normalizeSpriteDefs(graphics.center)

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
      const offsetX = offsetByPercentage ? 0 : (sprite.offsetX ?? 0)
      const x =
        (center -
          svg.width / TILE_SIZE_ACTUAL / 2 -
          left -
          (offsetByPercentage ? percentToNumber(sprite.offsetX) * center : 0) -
          offsetX / TILE_SIZE_ACTUAL) *
        TILE_SIZE *
        multiplier
      const distanceFromGround =
        multiplier *
        TILE_SIZE *
        ((svg.height - (sprite.originY ?? 0) + (sprite.offsetY ?? 0)) /
          TILE_SIZE_ACTUAL)

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
      const offsetTop =
        (graphics.scatter.originY ??
          graphics.scatter.originY + PERSON_SPRITE_OFFSET_Y) ||
        PERSON_SPRITE_OFFSET_Y

      const people = PEOPLE
        // Temporarily: filter out all people that uses the `beach` tag
        // outside of Coastmix mode
        // TODO: figure out how to specify tags for inclusion/exclusion
        // possibly append the beach list when needed.
        .filter((person) => {
          if (coastmixMode) {
            return true
          } else {
            return !person.tags?.includes('beach')
          }
        })

      drawScatteredSprites(
        people,
        ctx,
        actualWidth,
        offsetLeft - left * TILE_SIZE * multiplier,
        offsetTop,
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
        null,
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

export function getLocaleSegmentName(
  type: string,
  variantString: string
): string {
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
export function segmentsChanged(): void {
  const street = store.getState().street
  const calculatedWidths = recalculateWidth(street)
  const updatedSlices = applyWarningsToSlices(street, calculatedWidths)

  store.dispatch(
    updateSegments(
      updatedSlices,
      calculatedWidths.occupiedWidth.toNumber(),
      calculatedWidths.remainingWidth.toNumber()
    )
  )

  saveStreetToServerIfNecessary()
}

/**
 * Process / sanitize segment labels
 *
 * @params name - Segment label to check
 * @returns normalized / sanitized segment label
 */
function normalizeSegmentLabel(label: string): string | undefined {
  label = label.trim()

  // If label is the empty string, return undefined
  if (label === '') {
    return undefined
  }

  // Trim a long label
  if (label.length > MAX_SEGMENT_LABEL_LENGTH) {
    label = label.substr(0, MAX_SEGMENT_LABEL_LENGTH) + '…'
  }

  return label
}

/**
 * Uses browser prompt to change the segment label
 *
 * @param segment - object describing the segment to edit
 * @param position - index of segment to edit
 */
export function editSegmentLabel(segment: Segment, position: number): void {
  const prevLabel =
    segment.label || getLocaleSegmentName(segment.type, segment.variantString)

  // If prompt returns empty string, set label to undefined. This resets the
  // label to the original default name
  // If prompt returns null (the prompt has been canceled), do not change the
  // label.
  const labelInput = window.prompt(
    formatMessage('prompt.segment-label', 'New segment label:'),
    prevLabel
  )

  if (labelInput === null) {
    return
  }

  const label = normalizeSegmentLabel(labelInput)

  if (label !== prevLabel) {
    store.dispatch(changeSegmentProperties(position, { label }))
    segmentsChanged()
  }
}

/**
 * Given the position of a segment or building, retrieve a reference to its
 * DOM element.
 *
 * @param position - either "left" or "right" for building,
 *              or a number for the position of the segment. Should be
 *              the `segmentIndex` or `position` variables.
 */
export function getSegmentEl(position: number | BoundaryPosition): HTMLElement {
  let segmentEl: HTMLElement

  if (position === BUILDING_LEFT_POSITION) {
    segmentEl = document.querySelectorAll(
      '.street-section-boundary'
    )[0] as HTMLElement
  } else if (position === BUILDING_RIGHT_POSITION) {
    segmentEl = document.querySelectorAll(
      '.street-section-boundary'
    )[1] as HTMLElement
  } else {
    const segments = document
      .getElementById('street-section-editable')!
      .querySelectorAll('.segment') as NodeListOf<HTMLElement>
    segmentEl = segments?.[position]
  }

  return segmentEl
}
