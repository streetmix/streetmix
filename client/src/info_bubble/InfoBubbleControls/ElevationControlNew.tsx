import React from 'react'

import { segmentsChanged } from '~/src/segments/view'
import { useDispatch } from '~/src/store/hooks'
import { changeSegmentProperties } from '~/src/store/slices/street'
import Checkbox from '~/src/ui/Checkbox'
import UpDownInput from './UpDownInput'

import type { BoundaryPosition } from '@streetmix/types'

interface ElevationControlProps {
  position: number | BoundaryPosition
  elevation: number
  slope: boolean
}

function ElevationControlNew ({
  position,
  elevation,
  slope = false
}: ElevationControlProps): React.ReactElement {
  const dispatch = useDispatch()

  function handleSlopeChange (): void {
    if (typeof position === 'number') {
      dispatch(changeSegmentProperties(position, { slope: !slope }))
      segmentsChanged()
    }
  }

  function handleIncrement (): void {
    if (typeof position === 'number') {
      dispatch(changeSegmentProperties(position, { elevation: elevation + 1 }))
      segmentsChanged()
    }
  }

  function handleDecrement (): void {
    if (typeof position === 'number') {
      dispatch(changeSegmentProperties(position, { elevation: elevation - 1 }))
      segmentsChanged()
    }
  }

  return (
    <div className="variants">
      <UpDownInput
        value={elevation}
        minValue={0}
        maxValue={30}
        onClickUp={handleIncrement}
        onClickDown={handleDecrement}
      />
      {typeof position === 'number' && (
        <Checkbox checked={slope} onChange={handleSlopeChange}>
          Slope
        </Checkbox>
      )}
    </div>
  )
}

export default ElevationControlNew
