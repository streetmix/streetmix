import React from 'react'

import Building from '../segments/Building'

import type { BoundaryPosition } from '@streetmix/types'

interface BoundaryProps {
  position: BoundaryPosition
  buildingWidth: number
  updatePerspective: (el: HTMLElement) => void
}

function Boundary (props: BoundaryProps): React.ReactElement {
  return <Building {...props} />
}

export default Boundary
