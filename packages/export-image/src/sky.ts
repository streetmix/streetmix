import * as Canvas from '@napi-rs/canvas'

import type { SkyboxDefWithStyles, Street } from '@streetmix/types'

export async function drawSky (
  ctx: Canvas.SKRSContext2D,
  street: Street,
  width: number, // image width (scaled)
  height: number, // image height (scaled) - might not need for here
  horizonLine: number, // scaled - in many cases we only need to render to here because the rest is covered by ground
  groundLevel: number, // scaled
  scale: number
): Promise<void> {
  const sky = getSkyboxDef(street.data.street.skybox)

  // Solid color fill
  if (sky.backgroundColor !== undefined) {
    drawBackgroundColor(ctx, width, horizonLine, sky.backgroundColor)
  }

  // TODO: All the other backgrounds!

  // // Background image fill
  // if (sky.backgroundImage) {
  //   drawBackgroundImage(
  //     ctx,
  //     width,
  //     height,
  //     scale,
  //     sky.backgroundImage
  //   )
  // }

  // // Gradient fill
  // if (sky.backgroundGradient) {
  //   drawBackgroundGradient(ctx, width, horizonLine, scale, sky.backgroundGradient)
  // }

  // // Background objects
  // if (sky.backgroundObjects) {
  //   drawBackgroundObjects(
  //     ctx,
  //     width,
  //     height,
  //     scale,
  //     sky.backgroundObjects
  //   )
  // }

  // Clouds
  await drawClouds(ctx, width, groundLevel, scale, sky)
}

// TODO: Read other sky definitions.
function getSkyboxDef (id: string): SkyboxDefWithStyles {
  return {
    name: 'Day',
    backgroundColor: '#a9ccdb',
    id: 'day',
    style: {
      background: '#a9ccdb'
    },
    iconStyle: {
      background: '#a9ccdb'
    }
  }
}

/**
 * Draws a layer of background color
 *
 * @modifies {Canvas.SKRSContext2D | CanvasRenderingContext2D}
 */
function drawBackgroundColor (
  ctx: Canvas.SKRSContext2D,
  width: number,
  height: number,
  color: string
): void {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)
}

/**
 * Draws clouds.
 *
 * @modifies {Canvas.SKRSContext2D | CanvasRenderingContext2D}
 */
async function drawClouds (
  ctx: Canvas.SKRSContext2D,
  width: number,
  height: number, // This is actually not the image height but groundLevel height
  scale: number,
  sky: SkyboxDefWithStyles
): Promise<void> {
  // Handle cloud opacity
  ctx.save()
  ctx.globalAlpha = sky.cloudOpacity ?? 1

  // Grab images
  const skyFrontImgPath = import.meta
    .resolve('@streetmix/illustrations/images/sky/sky-front.svg')
    .replace('file://', '')
  const skyRearImgPath = import.meta
    .resolve('@streetmix/illustrations/images/sky/sky-rear.svg')
    .replace('file://', '')
  const skyFrontImg = await Canvas.loadImage(skyFrontImgPath)
  const skyRearImg = await Canvas.loadImage(skyRearImgPath)

  // Set the width and height here to scale properly
  // Source images are 2x scale intrinsically, so we also scale down by 2
  skyFrontImg.width = (skyFrontImg.naturalWidth * scale) / 2
  skyFrontImg.height = (skyFrontImg.naturalHeight * scale) / 2
  skyRearImg.width = (skyRearImg.naturalWidth * scale) / 2
  skyRearImg.height = (skyRearImg.naturalHeight * scale) / 2

  // Variables for convenience
  const skyFrontWidth = skyFrontImg.width
  const skyFrontHeight = skyFrontImg.height
  const skyRearWidth = skyRearImg.width
  const skyRearHeight = skyRearImg.height

  // TODO document magic numbers
  // y1 = top edge of sky-front image
  const y1 = height - skyFrontHeight

  for (let i = 0; i < Math.floor(width / skyFrontWidth) + 1; i++) {
    ctx.drawImage(
      skyFrontImg,
      0,
      0,
      skyFrontWidth,
      skyFrontHeight,
      i * skyFrontWidth,
      y1,
      skyFrontWidth,
      skyFrontHeight
    )
  }

  // TODO document magic numbers
  // y2 = top edge of sky-rear is 120 pixels above the top edge of sky-front
  // 120 must also be adjusted by scale value
  const y2 = height - skyFrontHeight - 120 * scale

  for (let i = 0; i < Math.floor(width / skyRearWidth) + 1; i++) {
    ctx.drawImage(
      skyRearImg,
      0,
      0,
      skyRearWidth,
      skyRearHeight,
      i * skyRearWidth,
      y2,
      skyRearWidth,
      skyRearHeight
    )
  }

  // Restore global opacity
  ctx.restore()
}
