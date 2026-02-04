import { useIntl } from 'react-intl'
import { Decimal } from 'decimal.js'

import {
  ELEVATION_INCREMENT,
  ELEVATION_INCREMENT_IMPERIAL,
} from '~/src/segments/constants.js'
import { useDispatch, useSelector } from '~/src/store/hooks.js'
import { segmentsChanged } from '~/src/store/actions/street.js'
import {
  changeSegmentProperties,
  setBoundaryElevation,
} from '~/src/store/slices/street.js'
import { SETTINGS_UNITS_IMPERIAL } from '~/src/users/constants.js'
import {
  convertMetricMeasurementToImperial,
  prettifyWidth,
  processWidthInput,
  stringifyMeasurementValue,
} from '~/src/util/width_units.js'
import { UpDownInput } from './UpDownInput.js'

import type { BoundaryPosition, UnitsSetting } from '@streetmix/types'

interface ElevationControlProps {
  position: number | BoundaryPosition
  elevation: number
  units: UnitsSetting
}

const MIN_ELEVATION = 0
const MAX_ELEVATION = 5 // in meters

/**
 * Given the elevation height, return a formatted value (using the
 * user's units setting and locale). Examples:
 *  - 0.15 => 0.15 m
 *  - 0.152 => 6″
 *  - 0.456 => 1′-6″
 * NOTE: This is actually using original prettifyWidth so we don't show
 * feet-inches in this^ format yet.
 */
function prettifyElevationHeight(
  value: number,
  units: UnitsSetting,
  locale: string
): string {
  return prettifyWidth(value, units, locale)
}

export function ElevationControlNew({
  position,
  elevation,
  units,
}: ElevationControlProps) {
  const locale = useSelector((state) => state.locale.locale)
  const dispatch = useDispatch()
  const intl = useIntl()

  function handleIncrement(): void {
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
      dispatch(
        changeSegmentProperties(position, {
          elevation: newValue,
          elevationChanged: true,
        })
      )
      dispatch(segmentsChanged())
    } else {
      dispatch(setBoundaryElevation(position, newValue))
    }
  }

  function handleDecrement(): void {
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
      dispatch(
        changeSegmentProperties(position, {
          elevation: newValue,
          elevationChanged: true,
        })
      )
      dispatch(segmentsChanged())
    } else {
      dispatch(setBoundaryElevation(position, newValue))
    }
  }

  const updateValue = (value: string): void => {
    const processedValue = processWidthInput(value, units)
    let newValue
    try {
      newValue = new Decimal(processedValue)
        .clamp(MIN_ELEVATION, MAX_ELEVATION)
        .toDecimalPlaces(3)
        .toNumber()
    } catch (e) {
      // Silently drop values that Decimal cannot parse
      if (e instanceof Error && /DecimalError/.test(e.message)) {
        return
      }

      // Log other errors
      console.error(e)
      return
    }

    if (typeof position === 'number') {
      dispatch(
        changeSegmentProperties(position, {
          elevation: newValue,
          elevationChanged: true,
        })
      )
      dispatch(segmentsChanged())
    } else {
      dispatch(setBoundaryElevation(position, newValue))
    }
  }

  /**
   * Given a raw numerical value, format it and return a decorated string for
   * when the input is being edited.
   */
  const inputValueFormatter = (value: number): string => {
    if (units === SETTINGS_UNITS_IMPERIAL) {
      const imperialValue = convertMetricMeasurementToImperial(value)
      return stringifyMeasurementValue(imperialValue, units, locale)
    } else {
      return stringifyMeasurementValue(value, units, locale)
    }
  }

  const displayValueFormatter = (value: number): string => {
    return prettifyElevationHeight(value, units, locale)
  }

  return (
    <UpDownInput
      value={elevation}
      minValue={MIN_ELEVATION}
      maxValue={MAX_ELEVATION}
      inputValueFormatter={inputValueFormatter}
      displayValueFormatter={displayValueFormatter}
      onClickUp={handleIncrement}
      onClickDown={handleDecrement}
      onUpdatedValue={updateValue}
      inputTooltip={intl.formatMessage({
        id: 'tooltip.elevation-input',
        defaultMessage: 'Change elevation',
      })}
      upTooltip={intl.formatMessage({
        id: 'tooltip.elevation-raise',
        defaultMessage: 'Raise elevation',
      })}
      downTooltip={intl.formatMessage({
        id: 'tooltip.elevation-lower',
        defaultMessage: 'Lower elevation',
      })}
    />
  )
}
