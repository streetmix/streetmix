import { useIntl } from 'react-intl'
import { Decimal } from 'decimal.js'
import {
  convertMetricMeasurementToImperial,
  prettifyWidth,
  stringifyMeasurementValue,
} from '@streetmix/utils'

import {
  ELEVATION_INCREMENT,
  ELEVATION_INCREMENT_IMPERIAL,
  MAX_ELEVATION_IMPERIAL,
  MAX_ELEVATION_METRIC,
  MIN_ELEVATION,
  SEGMENT_WIDTH_RESOLUTION_IMPERIAL,
  SEGMENT_WIDTH_RESOLUTION_METRIC,
} from '~/src/segments/constants.js'
import { useDispatch, useSelector } from '~/src/store/hooks.js'
import { segmentsChanged } from '~/src/store/actions/street.js'
import {
  changeSegmentProperties,
  setBoundaryElevation,
  setSeaLevel,
} from '~/src/store/slices/street.js'
import { SETTINGS_UNITS_IMPERIAL } from '~/src/users/constants.js'
import { processWidthInput } from '~/src/util/width_units.js'
import { UpDownInput } from './UpDownInput.js'

import type { BoundaryPosition, UnitsSetting } from '@streetmix/types'

interface ElevationControlProps {
  position: number | BoundaryPosition
  elevation: number
  units: UnitsSetting
  seaLevel: boolean
}

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
  seaLevel = false,
}: ElevationControlProps) {
  const locale = useSelector((state) => state.locale.locale)
  const dispatch = useDispatch()
  const intl = useIntl()

  function handleIncrement(event: React.MouseEvent): void {
    const precise = event.shiftKey

    const increment =
      units === SETTINGS_UNITS_IMPERIAL
        ? precise
          ? SEGMENT_WIDTH_RESOLUTION_IMPERIAL
          : ELEVATION_INCREMENT_IMPERIAL
        : precise
          ? SEGMENT_WIDTH_RESOLUTION_METRIC
          : ELEVATION_INCREMENT
    const maxValue =
      units === SETTINGS_UNITS_IMPERIAL
        ? MAX_ELEVATION_IMPERIAL
        : MAX_ELEVATION_METRIC
    const newValue = new Decimal(elevation)
      .plus(increment)
      .clamp(MIN_ELEVATION, maxValue)
      .toDecimalPlaces(3)
      .toNumber()

    if (typeof position === 'number') {
      dispatch(
        changeSegmentProperties(position, {
          elevation: newValue,
          elevationChanged: true,
        })
      )
    } else {
      // If we're setting a sea level, this applies to all boundaries.
      if (seaLevel) {
        dispatch(setSeaLevel(newValue))
      } else {
        dispatch(setBoundaryElevation(position, newValue))
      }
    }

    dispatch(segmentsChanged())
  }

  function handleDecrement(event: React.MouseEvent): void {
    const precise = event.shiftKey

    const increment =
      units === SETTINGS_UNITS_IMPERIAL
        ? precise
          ? SEGMENT_WIDTH_RESOLUTION_IMPERIAL
          : ELEVATION_INCREMENT_IMPERIAL
        : precise
          ? SEGMENT_WIDTH_RESOLUTION_METRIC
          : ELEVATION_INCREMENT
    const maxValue =
      units === SETTINGS_UNITS_IMPERIAL
        ? MAX_ELEVATION_IMPERIAL
        : MAX_ELEVATION_METRIC
    const newValue = new Decimal(elevation)
      .minus(increment)
      .clamp(MIN_ELEVATION, maxValue)
      .toDecimalPlaces(3)
      .toNumber()

    if (typeof position === 'number') {
      dispatch(
        changeSegmentProperties(position, {
          elevation: newValue,
          elevationChanged: true,
        })
      )
    } else {
      // If we're setting a sea level, this applies to all boundaries.
      if (seaLevel) {
        dispatch(setSeaLevel(newValue))
      } else {
        dispatch(setBoundaryElevation(position, newValue))
      }
    }

    dispatch(segmentsChanged())
  }

  const updateValue = (value: string): void => {
    const processedValue = processWidthInput(value, units)
    const maxValue =
      units === SETTINGS_UNITS_IMPERIAL
        ? MAX_ELEVATION_IMPERIAL
        : MAX_ELEVATION_METRIC
    let newValue
    try {
      newValue = new Decimal(processedValue)
        .clamp(MIN_ELEVATION, maxValue)
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
    } else {
      // If we're setting a sea level, this applies to all boundaries.
      if (seaLevel) {
        dispatch(setSeaLevel(newValue))
      } else {
        dispatch(setBoundaryElevation(position, newValue))
      }
    }

    dispatch(segmentsChanged())
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

  const inputTooltip = seaLevel
    ? intl.formatMessage({
        id: 'tooltip.sea-level-input',
        defaultMessage: 'Change sea level',
      })
    : intl.formatMessage({
        id: 'tooltip.ground-height-input',
        defaultMessage: 'Change ground height',
      })

  const upTooltip = seaLevel
    ? intl.formatMessage({
        id: 'tooltip.sea-level-raise',
        defaultMessage: 'Raise sea level',
      })
    : intl.formatMessage({
        id: 'tooltip.ground-height-raise',
        defaultMessage: 'Raise ground height',
      })

  const downTooltip = seaLevel
    ? intl.formatMessage({
        id: 'tooltip.sea-level-lower',
        defaultMessage: 'Lower sea level',
      })
    : intl.formatMessage({
        id: 'tooltip.ground-height-lower',
        defaultMessage: 'Lower ground height',
      })

  const maxValue =
    units === SETTINGS_UNITS_IMPERIAL
      ? MAX_ELEVATION_IMPERIAL
      : MAX_ELEVATION_METRIC

  return (
    <UpDownInput
      value={elevation}
      minValue={MIN_ELEVATION}
      maxValue={maxValue}
      inputValueFormatter={inputValueFormatter}
      displayValueFormatter={displayValueFormatter}
      onClickUp={handleIncrement}
      onClickDown={handleDecrement}
      onUpdatedValue={updateValue}
      inputTooltip={inputTooltip}
      upTooltip={upTooltip}
      downTooltip={downTooltip}
      upTooltipSublabel={intl.formatMessage({
        id: 'tooltip.width-tooltip-sublabel',
        defaultMessage: '(hold Shift for more precision)',
      })}
      downTooltipSublabel={intl.formatMessage({
        id: 'tooltip.width-tooltip-sublabel',
        defaultMessage: '(hold Shift for more precision)',
      })}
    />
  )
}
