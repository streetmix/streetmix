import React from 'react'

import {
  ELEVATION_INCREMENT,
  ELEVATION_INCREMENT_IMPERIAL
} from '~/src/segments/constants'
import { segmentsChanged } from '~/src/segments/view'
import { useDispatch } from '~/src/store/hooks'
import {
  changeSegmentProperties,
  setBoundaryElevation
} from '~/src/store/slices/street'
import { SETTINGS_UNITS_IMPERIAL } from '~/src/users/constants'
import { UpDownInput } from './UpDownInput'

import type { BoundaryPosition, UnitsSetting } from '@streetmix/types'

interface ElevationControlProps {
  position: number | BoundaryPosition
  elevation: number
  units: UnitsSetting
}

export function ElevationControlNew ({
  position,
  elevation,
  units
}: ElevationControlProps): React.ReactElement {
  const dispatch = useDispatch()

  function handleIncrement (): void {
    const increment =
      units === SETTINGS_UNITS_IMPERIAL
        ? ELEVATION_INCREMENT_IMPERIAL
        : ELEVATION_INCREMENT
    if (typeof position === 'number') {
      dispatch(
        changeSegmentProperties(position, { elevation: elevation + increment })
      )
      segmentsChanged()
    } else {
      dispatch(setBoundaryElevation(position, elevation + increment))
    }
  }

  function handleDecrement (): void {
    const increment =
      units === SETTINGS_UNITS_IMPERIAL
        ? ELEVATION_INCREMENT_IMPERIAL
        : ELEVATION_INCREMENT
    if (typeof position === 'number') {
      dispatch(
        changeSegmentProperties(position, { elevation: elevation - increment })
      )
      segmentsChanged()
    } else {
      dispatch(setBoundaryElevation(position, elevation - increment))
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
