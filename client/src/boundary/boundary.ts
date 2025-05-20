import BOUNDARY_DEFS from '../boundary/boundary_defs.yaml'
import type { BoundaryDefinition } from '@streetmix/types'

export function getBoundaryItem (variant: string): BoundaryDefinition {
  const item = BOUNDARY_DEFS[variant]
  if (item.id === undefined) {
    item.id = variant
  }

  return item
}
