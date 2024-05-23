// import { TILE_SIZE, BUILDING_SPACE } from '../../../client/src/segments/constants.js'
// import { getBuildingImageHeight } from '../../../client/src/segments/buildings.js'

import type { Street } from '@streetmix/types'

interface StreetImageOptions {
  transparentSky: boolean
  segmentNamesAndWidths: boolean
  streetName: boolean
  watermark: boolean
  scale: number // formerly `dpi`
}

// This can be adjusted to create much more hi-definition images
const DEFAULT_IMAGE_SCALE = 1.0 // 2.0

const IMAGE_MIN_HEIGHT = 400
const IMAGE_MIN_HEIGHT_WITH_STREET_NAME = IMAGE_MIN_HEIGHT + 150
const IMAGE_BOTTOM_PADDING = 60
const IMAGE_NAMES_WIDTHS_PADDING = 65

// copy paste values witout importing for now
const TILE_SIZE = 12 / 0.3048 // pixels, using imperial conversion rate to preserve render scale
const BUILDING_SPACE = 360

export function makeStreetImage (
  street: Street,
  opts: Partial<StreetImageOptions> = {}
): number[] {
  // Default options
  const options: StreetImageOptions = {
    transparentSky: false,
    segmentNamesAndWidths: true,
    streetName: true,
    watermark: true,
    scale: DEFAULT_IMAGE_SCALE,
    ...opts
  }

  const width = calculateImageWidth(street, options)
  const height = calculateImageHeight(street, options)

  // TEMP: just return calculated width/height
  return [width, height]
}

function calculateImageWidth (
  street: Street,
  options: StreetImageOptions
): number {
  const streetData = street.data.street
  // TODO: explain what * 2 is
  const baseWidth = TILE_SIZE * streetData.width + BUILDING_SPACE * 2
  return baseWidth * options.scale
}

function calculateImageHeight (
  street: Street,
  options: StreetImageOptions
): number {
  // const streetData = street.data.street
  const { streetName, segmentNamesAndWidths } = options

  // TODO: we can't do a real calc yet because we don't have access to assets
  // const leftHeight = getBuildingImageHeight(
  //   streetData.leftBuildingVariant,
  //   'left',
  //   streetData.leftBuildingHeight
  // )
  // const rightHeight = getBuildingImageHeight(
  //   streetData.rightBuildingVariant,
  //   'right',
  //   streetData.rightBuildingHeight
  // )

  let height = 500 // Math.max(leftHeight, rightHeight)

  if (height < IMAGE_MIN_HEIGHT) {
    height = IMAGE_MIN_HEIGHT
  }

  if (streetName && height < IMAGE_MIN_HEIGHT_WITH_STREET_NAME) {
    height = IMAGE_MIN_HEIGHT_WITH_STREET_NAME
  }

  height += IMAGE_BOTTOM_PADDING

  if (segmentNamesAndWidths) {
    height += IMAGE_NAMES_WIDTHS_PADDING
  }

  return height * options.scale
}
