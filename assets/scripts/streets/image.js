import { drawStreetThumbnail } from '../gallery/thumbnail'
import { BUILDING_SPACE, getBuildingImageHeight } from '../segments/buildings'
import { TILE_SIZE } from '../segments/constants'

// This can be adjusted to create much more hi-definition images
const SAVE_AS_IMAGE_DPI = 2.0

const SAVE_AS_IMAGE_MIN_HEIGHT = 400
const SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME = SAVE_AS_IMAGE_MIN_HEIGHT + 150
const SAVE_AS_IMAGE_BOTTOM_PADDING = 60

// Used in thumbnail
// TODO: a way to remove the circular dependency?!
export const SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING = 65

export function getStreetImage (street, transparentSky, segmentNamesAndWidths, streetName) {
  const width = (TILE_SIZE * street.width) + (BUILDING_SPACE * 2)

  const leftHeight = getBuildingImageHeight(street.leftBuildingVariant, 'left', street.leftBuildingHeight)
  const rightHeight = getBuildingImageHeight(street.rightBuildingVariant, 'right', street.rightBuildingHeight)

  let height = Math.max(leftHeight, rightHeight)

  if (height < SAVE_AS_IMAGE_MIN_HEIGHT) {
    height = SAVE_AS_IMAGE_MIN_HEIGHT
  }

  if (streetName && (height < SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME)) {
    height = SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME
  }

  height += SAVE_AS_IMAGE_BOTTOM_PADDING

  if (segmentNamesAndWidths) {
    height += SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING
  }

  const el = document.createElement('canvas')
  el.width = width * SAVE_AS_IMAGE_DPI
  el.height = height * SAVE_AS_IMAGE_DPI

  const ctx = el.getContext('2d')

  drawStreetThumbnail(ctx, street, width, height, SAVE_AS_IMAGE_DPI, 1.0, false, true, transparentSky, segmentNamesAndWidths, streetName)

  return el
}
