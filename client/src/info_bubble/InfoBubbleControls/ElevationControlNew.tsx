import React, { useEffect, useState } from 'react'

import { segmentsChanged } from '~/src/segments/view'
import { useDispatch } from '~/src/store/hooks'
import { changeSegmentProperties } from '~/src/store/slices/street'
import Checkbox from '~/src/ui/Checkbox'
import './ElevationControl.css'
import UpDownInput from './UpDownInput'

import type { Segment } from '@streetmix/types'

interface ElevationControlProps {
  position: number
  segment: Segment
}

function ElevationControlNew ({
  position,
  segment
}: ElevationControlProps): React.ReactElement {
  const [value, setValue] = useState(segment.elevation)
  const [isSlope, toggleSlope] = useState(segment.slope ?? false)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(changeSegmentProperties(position, { elevation: value }))
    segmentsChanged()
  }, [value])

  useEffect(() => {
    dispatch(changeSegmentProperties(position, { slope: isSlope }))
    segmentsChanged()
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
    <>
      <h3 className="elev-title">Elevation</h3>
      <UpDownInput
        value={value}
        minValue={1}
        maxValue={30}
        onClickUp={handleIncrement}
        onClickDown={handleDecrement}
        onUpdatedValue={handleChangeValue}
      />
      <Checkbox
        checked={isSlope}
        onChange={() => { toggleSlope(!isSlope) }}
      >
        Slope
      </Checkbox>
    </>
  )
}

export default ElevationControlNew
