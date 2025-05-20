import BOUNDARY_DEFS from '../boundary/boundary_defs.yaml'
import { images } from '../app/load_resources'
import { TILE_SIZE, TILESET_POINT_PER_PIXEL } from '../segments/constants'
import type { BoundaryDefinition, BoundaryPosition } from '@streetmix/types'

export function getBoundaryItem (variant: string): BoundaryDefinition {
  const item = BOUNDARY_DEFS[variant]
  if (item.id === undefined) {
    item.id = variant
  }

  return item
}

/**
 * Returns sprite id, given variant and position
 */
export function getSpriteId (
  variant: string,
  position: BoundaryPosition
): string {
  const item = getBoundaryItem(variant)
  return item.spriteId + (item.sameOnBothSides === true ? '' : '-' + position)
}

/**
 * Calculate boundary image height. For buildings that do not have multiple
 * floors, this is just the image's intrinsic height value. For buildings with
 * multiple floors, this must be calculated from the number of floors and
 * sprite pixel specifications.
 */
export function getBoundaryImageHeight (
  variant: string,
  position: BoundaryPosition,
  floors = 1
): number {
  const item = getBoundaryItem(variant)
  let height

  if (item.hasFloors) {
    height =
      (item.roofHeight +
        item.floorHeight * (floors - 1) +
        item.mainFloorHeight) *
      TILE_SIZE
  } else {
    const id = getSpriteId(variant, position)
    const svg = images.get(id)
    height = svg.height / TILESET_POINT_PER_PIXEL
  }

  return height
}

/**
 * Converts the number of floors to an actual height in meters
 */
export function calculateRealHeightNumber (
  variant: string,
  position: BoundaryPosition,
  floors: number
): number {
  const CURB_HEIGHT = 0.15 // meters
  return (
    (getBoundaryImageHeight(variant, position, floors) - CURB_HEIGHT) /
    TILE_SIZE
  )
}
