import { getSegmentInfo } from '@streetmix/parts'
import { TILE_SIZE } from './constants.js'

import type * as Canvas from '@napi-rs/canvas'
import type { StreetJson } from '@streetmix/types'

/**
 * Draws slices.
 */
export function drawSlices (
  ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D,
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

  console.log(zIndexes)

  // Render objects at each z-index level
  // for (const zIndex of zIndexes) {
  //   let currentOffsetLeft = offsetLeft

  //   for (let i = 0; i < street.segments.length; i++) {
  //     const slice = street.segments[i]
  //     const sliceInfo = getSegmentInfo(slice.type)

  //     if (sliceInfo.zIndex === zIndex) {
  //       const variantInfo = getSegmentVariantInfo(
  //         slice.type,
  //         slice.variantString
  //       )
  //       const dimensions = getVariantInfoDimensions(variantInfo, slice.width)
  //       const randSeed = slice.id

  //       // Slope
  //       const slopeData = calculateSlope(street, i)
  //       const elevationChange = {
  //         left: slice.elevation,
  //         right: slice.elevation
  //       }
  //       if (slice.slope && slopeData !== null) {
  //         elevationChange.left = slopeData.leftElevation
  //         elevationChange.right = slopeData.rightElevation
  //       }

  //       drawSegmentContents(
  //         ctx,
  //         slice.type,
  //         slice.variantString,
  //         slice.width,
  //         currentOffsetLeft + dimensions.left * TILE_SIZE * multiplier,
  //         groundLevel,
  //         slice.elevation,
  //         elevationChange,
  //         randSeed,
  //         multiplier,
  //         dpi
  //       )
  //     }

  //     currentOffsetLeft += slice.width * TILE_SIZE * multiplier
  //   }
  // }
}
