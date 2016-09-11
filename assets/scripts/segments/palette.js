import { debug } from '../preinit/debug_settings'
import { generateRandSeed } from '../util/random'
import { SEGMENT_INFO } from './info'
import { TILE_SIZE, getVariantInfoDimensions, createSegment } from './view'

import { getElAbsolutePos } from '../util/helpers'

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

    var dimensions = getVariantInfoDimensions(variantInfo, 0, 1)

    var width = dimensions.right - dimensions.left
    if (!width) {
      width = segmentInfo.defaultWidth
    }
    width += PALETTE_EXTRA_SEGMENT_PADDING

    var el = createSegment(id,
      variantName,
      width * TILE_SIZE / WIDTH_PALETTE_MULTIPLIER,
      false,
      true,
      generateRandSeed())

    el.classList.add('segment-in-palette')

    document.querySelector('.palette-canvas').appendChild(el)
  }

  setupPaletteAdjustmentOnLocaleChange()
}

function setupPaletteAdjustmentOnLocaleChange () {
  window.addEventListener('stmx:language_changed', () => {
    const paletteCommands = document.querySelector('.palette-commands')
    const paletteCommandsWidth = paletteCommands.getBoundingClientRect().width

    const rightButtonEl = document.querySelector('.palette-container button.scroll-right')
    const paletteEl = document.querySelector('.palette')

    // Reset
    paletteEl.style.right = ''
    // dupe from scroll.js repositionScrollButtons()
    rightButtonEl.style.left = (getElAbsolutePos(paletteEl)[0] + paletteEl.offsetWidth) + 'px'

    // Only do work if palette commands has increased in width
    if (paletteCommandsWidth > 105) {
      const delta = paletteCommandsWidth - 105
      const currentScrollRightButtonPos = window.parseInt(rightButtonEl.style.left, 10)
      const newScrollRightButtonPos = currentScrollRightButtonPos - delta
      rightButtonEl.style.left = newScrollRightButtonPos + 'px'

      const paletteRightPos = window.parseInt(window.getComputedStyle(paletteEl).right, 10)
      const newPaletteRightPos = paletteRightPos + delta
      paletteEl.style.right = newPaletteRightPos + 'px'
    }
  })
}
