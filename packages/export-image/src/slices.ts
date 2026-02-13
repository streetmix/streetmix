/* eslint-disable @typescript-eslint/no-unused-vars */
import { getSegmentInfo } from '@streetmix/parts'
import { TILE_SIZE } from './constants.js'

import type * as Canvas from '@napi-rs/canvas'
import type { StreetJson } from '@streetmix/types'

/**
 * Draws slices.
 */
export function drawSlices(
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

      //   drawSegmentContents(
      //     ctx,
      //     slice.type,
      //     slice.variantString,
      //     slice.width,
      //     currentOffsetLeft + dimensions.left * TILE_SIZE * scale,
      //     groundLevel,
      //     slice.elevation,
      //     slice.slope,
      //     randSeed,
      //     scale
      //   )
      // }

      currentOffsetLeft += slice.width * TILE_SIZE * scale
    }
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
//   slope: SlopeProperties,
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
