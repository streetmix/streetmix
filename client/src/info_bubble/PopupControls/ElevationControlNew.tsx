import React from 'react'
import { useIntl } from 'react-intl'
import { Decimal } from 'decimal.js'

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
  const intl = useIntl()

  function handleIncrement (): void {
    const increment =
      units === SETTINGS_UNITS_IMPERIAL
        ? ELEVATION_INCREMENT_IMPERIAL
        : ELEVATION_INCREMENT
    const newValue = new Decimal(elevation).plus(increment).toNumber()
    if (typeof position === 'number') {
      dispatch(changeSegmentProperties(position, { elevation: newValue }))
      segmentsChanged()
    } else {
      dispatch(setBoundaryElevation(position, newValue))
    }
  }

  function handleDecrement (): void {
    const increment =
      units === SETTINGS_UNITS_IMPERIAL
        ? ELEVATION_INCREMENT_IMPERIAL
        : ELEVATION_INCREMENT
    const newValue = new Decimal(elevation).minus(increment).toNumber()
    if (typeof position === 'number') {
      dispatch(changeSegmentProperties(position, { elevation: newValue }))
      segmentsChanged()
    } else {
      dispatch(setBoundaryElevation(position, newValue))
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
        upTooltip={intl.formatMessage({
          id: 'tooltip.elevation-raise',
          defaultMessage: 'Raise elevation'
        })}
        downTooltip={intl.formatMessage({
          id: 'tooltip.elevation-lower',
          defaultMessage: 'Lower elevation'
        })}
      />
    </div>
  )
}
