import path from 'node:path'
import fs from 'node:fs'
import * as Canvas from '@napi-rs/canvas'

import { getWatermarkString } from './locale.js'

const WATERMARK_FONT = 'Rubik'
const WATERMARK_FONT_SIZE = 24
const WATERMARK_FONT_WEIGHT = '600'
const WATERMARK_RIGHT_MARGIN = 15
const WATERMARK_BOTTOM_MARGIN = 15
const WATERMARK_DARK_COLOR = '#333333'
const WATERMARK_LIGHT_COLOR = '#cccccc'

const WORDMARK_MARGIN = 4

/**
 * Draws a "made with Streetmix" watermark on the lower right of the image.
 *
 * @todo Make it work with rtl
 * @modifies {Canvas.SKRSContext2D}
 */
export async function drawWatermark(
  ctx: Canvas.SKRSContext2D,
  locale: string,
  invert: boolean = false,
  scale: number
): Promise<void> {
  const text = await getWatermarkString(locale, 'Made with {streetmixWordmark}')

  // Separate string so that we can render a wordmark with an image
  const strings = text.replace(/{/g, '||{').replace(/}/g, '}||').split('||')

  // Reload image each render because the width/height setting needs to start
  // from scratch
  const source = invert
    ? '../assets/wordmark_white.svg'
    : '../assets/wordmark_black.svg'
  const image = await fs.promises.readFile(
    path.join(import.meta.dirname, source)
  )
  const wordmarkImage = await Canvas.loadImage(image)

  // Set the width and height properties on the image so it scales without
  // pixellation. Also, divide by 4 because source image is larger
  wordmarkImage.width = (wordmarkImage.width * scale) / 4
  wordmarkImage.height = (wordmarkImage.height * scale) / 4

  // Save previous canvas context
  ctx.save()

  // Set text render options
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `normal ${WATERMARK_FONT_WEIGHT} ${
    WATERMARK_FONT_SIZE * scale
  }px ${WATERMARK_FONT},sans-serif`
  // This is NOT standard, but is currently implemented this way in @napi-rs/canvas
  ctx.fontVariationSettings = `'wght' ${WATERMARK_FONT_WEIGHT}`
  ctx.fillStyle = invert ? WATERMARK_LIGHT_COLOR : WATERMARK_DARK_COLOR

  // Set starting X/Y positions so that watermark is aligned right and bottom of image
  const startRightX = ctx.canvas.width - WATERMARK_RIGHT_MARGIN * scale
  const startBottomY = ctx.canvas.height - WATERMARK_BOTTOM_MARGIN * scale

  // Set wordmark width and height based on image scale
  const wordmarkWidth = wordmarkImage.width
  const wordmarkHeight = wordmarkImage.height

  // Keep track of where we are on the X-position.
  let currentRightX = startRightX

  // Render each part of the string.
  for (let i = strings.length - 1; i >= 0; i--) {
    const string = strings[i]

    // If we see the wordmark placeholder, render the image.
    if (string === '{streetmixWordmark}') {
      const margin = WORDMARK_MARGIN * scale
      const wordmarkLeftX = currentRightX - wordmarkWidth - margin
      const wordmarkTopY = startBottomY - wordmarkHeight + scale // Additional adjustment for visual alignment

      ctx.drawImage(wordmarkImage, wordmarkLeftX, wordmarkTopY)

      // Update X position.
      currentRightX = wordmarkLeftX - margin
    } else {
      ctx.fillText(string, currentRightX, startBottomY)

      // Update X position.
      currentRightX = currentRightX - ctx.measureText(string).width
    }
  }

  // Restore previous canvas context
  ctx.restore()
}
