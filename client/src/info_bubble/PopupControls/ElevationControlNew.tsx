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

const MIN_ELEVATION = 0
const MAX_ELEVATION = 5 // in meters

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
    const newValue = new Decimal(elevation)
      .plus(increment)
      .clamp(MIN_ELEVATION, MAX_ELEVATION)
      .toDecimalPlaces(3)
      .toNumber()
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
    const newValue = new Decimal(elevation)
      .minus(increment)
      .clamp(MIN_ELEVATION, MAX_ELEVATION)
      .toDecimalPlaces(3)
      .toNumber()
    if (typeof position === 'number') {
      dispatch(changeSegmentProperties(position, { elevation: newValue }))
      segmentsChanged()
    } else {
      dispatch(setBoundaryElevation(position, newValue))
    }
  }

  const displayValueFormatter = (value: number): string => {
    return value.toString()
    // return prettifyHeight(variant, position, value, units, intl.formatMessage)
  }

  return (
    <div className="non-variant">
      <UpDownInput
        value={elevation}
        minValue={MIN_ELEVATION}
        maxValue={MAX_ELEVATION}
        displayValueFormatter={displayValueFormatter}
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
