import * as Canvas from '@napi-rs/canvas'

import type { SkyboxDefWithStyles, Street } from '@streetmix/types'

export async function drawSky (
  ctx: Canvas.SKRSContext2D,
  street: Street,
  width: number,
  height: number,
  horizonLine: number,
  groundLevel: number,
  scale: number
): Promise<void> {
  const sky = getSkyboxDef(street.data.street.skybox)

  // Solid color fill
  if (sky.backgroundColor !== undefined) {
    drawBackgroundColor(ctx, width, horizonLine, scale, sky.backgroundColor)
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
  // TODO: fix cloud at scale !== 1
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
  scale: number,
  color: string
): void {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width * scale, height * scale)
}

/**
 * Draws clouds.
 *
 * @modifies {Canvas.SKRSContext2D | CanvasRenderingContext2D}
 */
async function drawClouds (
  ctx: Canvas.SKRSContext2D,
  width: number,
  height: number,
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
  skyFrontImg.width = skyFrontImg.width * scale
  skyFrontImg.height = skyFrontImg.height * scale
  skyRearImg.width = skyRearImg.width * scale
  skyRearImg.height = skyRearImg.height * scale

  // Source images are 2x what they need to be for the math to work
  // so until we resize the intrinsic size of the images, we have to
  // do this and then size it back up later
  const skyFrontWidth = skyFrontImg.width / 2
  const skyFrontHeight = skyFrontImg.height / 2
  const skyRearWidth = skyRearImg.width / 2
  const skyRearHeight = skyRearImg.height / 2

  // TODO document magic numbers
  // y1 = top edge of sky-front image
  const y1 = height - skyFrontHeight

  for (let i = 0; i < Math.floor(width / skyFrontWidth) + 1; i++) {
    ctx.drawImage(
      skyFrontImg,
      0,
      0,
      skyFrontWidth * 2,
      skyFrontHeight * 2, // todo: change intrinsic size
      i * skyFrontWidth * scale,
      y1 * scale,
      skyFrontWidth * scale,
      skyFrontHeight * scale
    )
  }

  // TODO document magic numbers
  // y2 = top edge of sky-rear is 120 pixels above the top edge of sky-front
  const y2 = height - skyFrontHeight - 120

  for (let i = 0; i < Math.floor(width / skyRearWidth) + 1; i++) {
    ctx.drawImage(
      skyRearImg,
      0,
      0,
      skyRearWidth * 2,
      skyRearHeight * 2, // todo: change intrinsic size
      i * skyRearWidth * scale,
      y2 * scale,
      skyRearWidth * scale,
      skyRearHeight * scale
    )
  }

  // Restore global opacity
  ctx.restore()
}
