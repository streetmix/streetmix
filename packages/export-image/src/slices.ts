/* eslint-disable @typescript-eslint/no-unused-vars */
import { getSegmentInfo } from '@streetmix/parts'
import { TILE_SIZE } from './constants.js'

import type * as Canvas from '@napi-rs/canvas'
import type { StreetJson, ElevationChange } from '@streetmix/types'

/**
 * Draws slices.
 */
export function drawSlices (
  ctx: Canvas.SKRSContext2D,
  street: StreetJson, // street data
  groundLevel: number, // vertical height of ground
  offsetLeft: number, // left position to start from
  scale: number // scale factor of image
): void {
  // Collect z-indexes
  const zIndexes = []
  for (const slice of street.segments) {
    const sliceInfo = getSegmentInfo(slice.type)

    if (zIndexes.indexOf(sliceInfo.zIndex) === -1) {
      zIndexes.push(sliceInfo.zIndex)
    }
  }

  // Render objects at each z-index level
  for (const zIndex of zIndexes) {
    let currentOffsetLeft = offsetLeft

    for (let i = 0; i < street.segments.length; i++) {
      const slice = street.segments[i]
      const sliceInfo = getSegmentInfo(slice.type)

      // if (sliceInfo.zIndex === zIndex) {
      //   // const variantInfo = getSegmentVariantInfo(
      //   //   slice.type,
      //   //   slice.variantString
      //   // )
      //   // const dimensions = getVariantInfoDimensions(variantInfo, slice.width)
      //   // placeholder
      //   const dimensions = {
      //     left: 0
      //   }
      //   const randSeed = slice.id

      //   // Slope
      //   const slopeData = calculateSlope(street, i)
      //   const elevationChange = {
      //     left: slice.elevation,
      //     right: slice.elevation
      //   }
      //   if (slice.slope && slopeData !== null) {
      //     elevationChange.left = slopeData.leftElevation
      //     elevationChange.right = slopeData.rightElevation
      //   }

      //   drawSegmentContents(
      //     ctx,
      //     slice.type,
      //     slice.variantString,
      //     slice.width,
      //     currentOffsetLeft + dimensions.left * TILE_SIZE * scale,
      //     groundLevel,
      //     slice.elevation,
      //     elevationChange,
      //     randSeed,
      //     scale
      //   )
      // }

      currentOffsetLeft += slice.width * TILE_SIZE * scale
    }
  }
}

// temp ported from client
export interface SlopeCalculation {
  leftElevation: number
  rightElevation: number
  slope: string
  ratio: number | undefined
  warnings: {
    slopeExceededBerm: boolean
    slopeExceededPath: boolean
  }
}

export function calculateSlope (
  street: StreetJson,
  index: number
): SlopeCalculation | null {
  const slice = street.segments[index]

  // If slice does not exist (e.g. index out of bounds) return null
  if (!slice) return null

  // Get elevation of slices adjacent to current slice
  let leftElevation = street.segments[index - 1]?.elevation
  let rightElevation = street.segments[index + 1]?.elevation

  // If slice is first or last in the list, adjacent elevation is
  // taken from boundary. We need a fallback for older street data
  // that don't have boundary data
  if (index === 0) {
    leftElevation = street.boundary?.left.elevation ?? 0.15
  }
  if (index === street.segments.length - 1) {
    rightElevation = street.boundary?.right.elevation ?? 0.15
  }

  // If slope is off, don't calculate the change in elevation, even if
  // neighboring elevation differs
  const rise = slice.slope ? Math.abs(leftElevation - rightElevation) : 0

  // Get slope in percentage
  const slope = ((rise / slice.width) * 100).toFixed(2)

  // Get slope as ratio (horizontal:vertical)
  // If rise is 0, return undefined to prevent divide by zero error
  const ratio = rise !== 0 ? Number((slice.width / rise).toFixed(2)) : undefined

  // Warnings for exceeded slope
  // There are two thresholds:
  // (1) for berms:
  //    "Slopes of 3H:1V (Horizontal:Vertical) are recommended for stability
  //    and ease of maintenance"
  // (2) for paths:
  //    "ADA accessibility and connection to inland area and waterfront is
  //    required. Accessible routes shall not exceed 5% (1V:20H
  //    (vertical:horizontal)) slope"
  const warnings = {
    slopeExceededBerm: ratio !== undefined && ratio < 3,
    slopeExceededPath: ratio !== undefined && ratio < 20
  }

  return {
    leftElevation,
    rightElevation,
    slope,
    ratio,
    warnings
  }
}

// temp
// function drawSegmentContents (
//   ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D,
//   type: string,
//   variantString: string,
//   actualWidth: number,
//   offsetLeft: number,
//   groundBaseline: number,
//   elevation: number,
//   slope: ElevationChange,
//   randSeed: string,
//   scale: number
// ) {
//   const variantInfo = getSegmentVariantInfo(type, variantString)
//   const graphics = variantInfo.graphics

//   // TODO: refactor this variable
//   const segmentWidth = actualWidth * TILE_SIZE

//   const dimensions = getVariantInfoDimensions(variantInfo, actualWidth)
//   const left = dimensions.left
//   const minWidthQuirk = graphics.quirks?.minWidth

//   const groundLevelOffsetY = variantInfo.offsetY ?? 0
//   const elevationValue = getElevation(elevation)
//   const groundLevel =
//     groundBaseline -
//     multiplier * (groundLevelOffsetY / TILESET_POINT_PER_PIXEL) -
//     multiplier * elevationValue

//   const coastmixMode = store.getState().flags.COASTMIX_MODE.value

//   if (graphics.ground) {
//     const sprites = normalizeSpriteDefs(graphics.ground)

//     // This technically supports multiple ground textures because it's the same
//     // data structure as the other sprite definitions, but in practice you
//     // would only render/see one texture.
//     for (let l = 0; l < sprites.length; l++) {
//       const sprite = getSpriteDef(sprites[l])
//       const svg = images.get(sprite.id)

//       // Skip drawing if sprite is missing
//       if (!svg) continue

//       // For ground assets, use a shape and fill, skip the rest
//       // Adjust left position because some slices have a left overhang
//       const x = left < 0 ? -left * TILE_SIZE * multiplier : 0

//       drawGroundPattern(
//         ctx,
//         segmentWidth,
//         offsetLeft + x,
//         groundBaseline,
//         slope,
//         sprite.id,
//         multiplier,
//         dpi
//       )
//     }
//   }

// }
