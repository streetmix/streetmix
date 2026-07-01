import BOUNDARY_DEFS from './data/boundary_defs.json' with { type: 'json' }

import type { BoundaryDefinition } from '@streetmix/types'

export function getBoundaryItem(variant: string): BoundaryDefinition {
  if (!(variant in BOUNDARY_DEFS)) {
    throw new Error('Unknown boundary variant: ' + variant)
  }

  const item = BOUNDARY_DEFS[variant as keyof typeof BOUNDARY_DEFS]

  if (item.id === undefined) {
    item.id = variant
  }

  return item as BoundaryDefinition
}
