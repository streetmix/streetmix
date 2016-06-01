/* global TILE_SIZE, street, system */

import { drawStreetThumbnail } from '../gallery/thumbnail'
import { BUILDING_SPACE, getBuildingAttributes } from '../segments/buildings'

const SAVE_AS_IMAGE_DPI = 2.0
const SAVE_AS_IMAGE_MIN_HEIGHT = 400
const SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME = SAVE_AS_IMAGE_MIN_HEIGHT + 150
const SAVE_AS_IMAGE_BOTTOM_PADDING = 60

// Used in thumbnail
// TODO: a way to remove the circular dependency?!
export const SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING = 65

export function getStreetImage (transparentSky, segmentNamesAndWidths, streetName) {
  const width = TILE_SIZE * street.width + BUILDING_SPACE * 2

  const leftBuildingAttr = getBuildingAttributes(street, true)
  const rightBuildingAttr = getBuildingAttributes(street, false)

  const leftHeight = leftBuildingAttr.height
  const rightHeight = rightBuildingAttr.height

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

  // TODO hack
  const oldDpi = system.hiDpi
  system.hiDpi = SAVE_AS_IMAGE_DPI
  drawStreetThumbnail(ctx, street, width, height, 1.0, false, true, transparentSky, segmentNamesAndWidths, streetName)
  system.hiDpi = oldDpi

  return el
}
