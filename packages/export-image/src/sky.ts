import * as Canvas from '@napi-rs/canvas'

import type { SkyboxDefWithStyles, StreetJson } from '@streetmix/types'

const SKY_GAP = 120 // height difference between sky-rear and sky-front images

export async function drawSky (
  ctx: Canvas.SKRSContext2D,
  street: StreetJson,
  width: number, // image width (scaled)
  height: number, // image height (scaled) - might not need for here
  horizonLine: number, // lower edge of sky area
  groundLevel: number, // ground elevation line
  scale: number
): Promise<void> {
  const sky = getSkyboxDef(street.skybox)

  // Solid color fill
  if (sky.backgroundColor !== undefined) {
    drawBackgroundColor(ctx, width, horizonLine * scale, sky.backgroundColor)
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
  //   drawBackgroundGradient(ctx, width, horizonLine * scale, scale, sky.backgroundGradient)
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
function getSkyboxDef (_id: string): SkyboxDefWithStyles {
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
 * @modifies {Canvas.SKRSContext2D}
 */
function drawBackgroundColor (
  ctx: Canvas.SKRSContext2D,
  width: number,
  height: number,
  color: string
): void {
  ctx.save()
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

/**
 * Draws clouds.
 *
 * @modifies {Canvas.SKRSContext2D}
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
  skyFrontImg.width = skyFrontImg.naturalWidth * scale
  skyFrontImg.height = skyFrontImg.naturalHeight * scale
  skyRearImg.width = skyRearImg.naturalWidth * scale
  skyRearImg.height = skyRearImg.naturalHeight * scale

  // dy1 = top edge of sky-front image
  const dy1 = height * scale - skyFrontImg.height

  for (let i = 0; i < Math.floor(width / skyFrontImg.width) + 1; i++) {
    ctx.drawImage(
      skyFrontImg,
      0,
      0,
      skyFrontImg.width,
      skyFrontImg.height,
      i * skyFrontImg.width,
      dy1,
      skyFrontImg.width,
      skyFrontImg.height
    )
  }

  // dy2 = top edge of sky-rear is SKY_GAP pixels above the top edge of sky-front
  // (height - SKY_GAP) must also be adjusted by scale value
  const dy2 = (height - SKY_GAP) * scale - skyFrontImg.height

  for (let i = 0; i < Math.floor(width / skyRearImg.width) + 1; i++) {
    ctx.drawImage(
      skyRearImg,
      0,
      0,
      skyRearImg.width,
      skyRearImg.height,
      i * skyRearImg.width,
      dy2,
      skyRearImg.width,
      skyRearImg.height
    )
  }

  // Restore global opacity
  ctx.restore()
}
