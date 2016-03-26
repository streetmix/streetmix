/* global SEGMENT_INFO, TILE_SIZE, debug */
/* global _getVariantInfoDimensions, _createSegment */
import { generateRandSeed } from '../util/random'

const WIDTH_PALETTE_MULTIPLIER = 4
const PALETTE_EXTRA_SEGMENT_PADDING = 8

export function createPalette () {
  for (var id in SEGMENT_INFO) {
    var segmentInfo = SEGMENT_INFO[id]

    if (segmentInfo.secret && !debug.secretSegments) {
      break
    }

    var variantName
    if (segmentInfo.paletteIcon) {
      variantName = segmentInfo.paletteIcon
    } else {
      // TODO hack to get the first variant name
      for (var j in segmentInfo.details) {
        variantName = j
        break
      }
    }

    var variantInfo = segmentInfo.details[variantName]

    var dimensions = _getVariantInfoDimensions(variantInfo, 0, 1)

    var width = dimensions.right - dimensions.left
    if (!width) {
      width = segmentInfo.defaultWidth
    }
    width += PALETTE_EXTRA_SEGMENT_PADDING

    var el = _createSegment(id,
      variantName,
      width * TILE_SIZE / WIDTH_PALETTE_MULTIPLIER,
      false,
      true,
      generateRandSeed())

    el.classList.add('palette')

    document.querySelector('.palette-canvas').appendChild(el)
  }
}
