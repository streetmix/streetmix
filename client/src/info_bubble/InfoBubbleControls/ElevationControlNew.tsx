import React, { useEffect, useState } from 'react'

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
  const [value, setValue] = useState(elevation)
  const [isSlope, toggleSlope] = useState(slope)
  const dispatch = useDispatch()

  useEffect(() => {
    if (typeof position === 'number') {
      dispatch(changeSegmentProperties(position, { elevation: value }))
      segmentsChanged()
    }
  }, [value])

  useEffect(() => {
    if (typeof position === 'number') {
      dispatch(changeSegmentProperties(position, { slope: isSlope }))
      segmentsChanged()
    }
  }, [isSlope])

  function handleChangeValue (value: string): void {
    const elevation = Number.parseInt(value, 10)
    setValue(elevation)
  }

  function handleIncrement (): void {
    setValue((value) => value + 1)
  }

  function handleDecrement (): void {
    setValue((value) => value - 1)
  }

  return (
    <div className="variants">
      <UpDownInput
        value={value}
        minValue={0}
        maxValue={30}
        onClickUp={handleIncrement}
        onClickDown={handleDecrement}
        onUpdatedValue={handleChangeValue}
      />
      {typeof position === 'number' && (
        <Checkbox
          checked={isSlope}
          onChange={() => {
            toggleSlope(!isSlope)
          }}
        >
          Slope
        </Checkbox>
      )}
    </div>
  )
}

export default ElevationControlNew
