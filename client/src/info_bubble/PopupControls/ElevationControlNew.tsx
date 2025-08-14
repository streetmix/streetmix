import React from 'react'

import { segmentsChanged } from '~/src/segments/view'
import { useDispatch } from '~/src/store/hooks'
import {
  changeSegmentProperties,
  setBoundaryElevation
} from '~/src/store/slices/street'
import UpDownInput from './UpDownInput'

import type { BoundaryPosition } from '@streetmix/types'

interface ElevationControlProps {
  position: number | BoundaryPosition
  elevation: number
}

function ElevationControlNew ({
  position,
  elevation
}: ElevationControlProps): React.ReactElement {
  const dispatch = useDispatch()

  function handleIncrement (): void {
    if (typeof position === 'number') {
      dispatch(changeSegmentProperties(position, { elevation: elevation + 1 }))
      segmentsChanged()
    } else {
      dispatch(setBoundaryElevation(position, elevation + 1))
    }
  }

  function handleDecrement (): void {
    if (typeof position === 'number') {
      dispatch(changeSegmentProperties(position, { elevation: elevation - 1 }))
      segmentsChanged()
    } else {
      dispatch(setBoundaryElevation(position, elevation - 1))
    }
  }

  return (
    <div className="non-variant">
      <UpDownInput
        value={elevation}
        minValue={0}
        maxValue={30}
        onClickUp={handleIncrement}
        onClickDown={handleDecrement}
      />
    </div>
  )
}

export default ElevationControlNew
