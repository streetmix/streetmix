import BOUNDARY_DEFS from '../boundary/boundary_defs.yaml'
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
