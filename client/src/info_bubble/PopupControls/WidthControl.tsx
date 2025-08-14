import React from 'react'
import { useIntl } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { incrementSegmentWidth } from '~/src/store/actions/street'
import { MIN_SEGMENT_WIDTH, MAX_SEGMENT_WIDTH } from '~/src/segments/constants'
import { RESIZE_TYPE_TYPING, resizeSegment } from '~/src/segments/resizing'
import {
  prettifyWidth,
  stringifyMeasurementValue,
  processWidthInput,
  convertMetricMeasurementToImperial
} from '~/src/util/width_units'
import { SETTINGS_UNITS_IMPERIAL } from '~/src/users/constants'
import { UpDownInput } from './UpDownInput'

interface WidthControlProps {
  position: number
}

export function WidthControl ({
  position
}: WidthControlProps): React.ReactElement {
  const value = useSelector((state) => state.street.segments[position].width)
  const units = useSelector((state) => state.street.units)
  const locale = useSelector((state) => state.locale.locale)
  const dispatch = useDispatch()
  const intl = useIntl()

  const handleIncrement = (event: React.MouseEvent): void => {
    const precise = event.shiftKey

    dispatch(incrementSegmentWidth(position, true, precise))
  }

  const handleDecrement = (event: React.MouseEvent): void => {
    const precise = event.shiftKey

    dispatch(incrementSegmentWidth(position, false, precise))
  }

  /**
   * When given a new value from input, process it, then update the model.
   */
  const updateModel = (value: string): void => {
    const processedValue = processWidthInput(value, units)
    if (processedValue) {
      resizeSegment(position, RESIZE_TYPE_TYPING, processedValue, units)
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

  /**
   * Given a raw numerical value, format it and return a decorated string for
   * display when the input is not being edited.
   */
  const displayValueFormatter = (value: number): string => {
    return prettifyWidth(value, units, locale)
  }

  return (
    <div className="non-variant">
      <UpDownInput
        value={value}
        minValue={MIN_SEGMENT_WIDTH}
        maxValue={MAX_SEGMENT_WIDTH}
        inputValueFormatter={inputValueFormatter}
        displayValueFormatter={displayValueFormatter}
        onClickUp={handleIncrement}
        onClickDown={handleDecrement}
        onUpdatedValue={updateModel}
        inputTooltip={intl.formatMessage({
          id: 'tooltip.segment-width',
          defaultMessage: 'Change width of the segment'
        })}
        upTooltip={intl.formatMessage({
          id: 'tooltip.increase-width',
          defaultMessage: 'Increase width'
        })}
        downTooltip={intl.formatMessage({
          id: 'tooltip.decrease-width',
          defaultMessage: 'Decrease width'
        })}
        upTooltipSublabel={intl.formatMessage({
          id: 'tooltip.width-tooltip-sublabel',
          defaultMessage: '(hold Shift for more precision)'
        })}
        downTooltipSublabel={intl.formatMessage({
          id: 'tooltip.width-tooltip-sublabel',
          defaultMessage: '(hold Shift for more precision)'
        })}
      />
    </div>
  )
}
