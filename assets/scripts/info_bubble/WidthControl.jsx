import React from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { MIN_SEGMENT_WIDTH, MAX_SEGMENT_WIDTH } from '../segments/constants'
import { RESIZE_TYPE_TYPING, resizeSegment } from '../segments/resizing'
import {
  prettifyWidth,
  stringifyMeasurementValue,
  processWidthInput,
  convertMetricMeasurementToImperial
} from '../util/width_units'
import { SETTINGS_UNITS_IMPERIAL } from '../users/constants'
import { incrementSegmentWidth } from '../store/actions/street'
import UpDownInput from './UpDownInput'

WidthControl.propTypes = {
  position: PropTypes.number
}

function WidthControl ({ position }) {
  const value = useSelector(
    (state) =>
      (state.street.segments[position] &&
        state.street.segments[position].width) ||
      null
  )
  const units = useSelector((state) => state.street.units)
  const locale = useSelector((state) => state.locale.locale)
  const dispatch = useDispatch()
  const intl = useIntl()

  const handleIncrement = (event) => {
    const precise = event.shiftKey

    dispatch(incrementSegmentWidth(position, true, precise, value))
  }

  const handleDecrement = (event) => {
    const precise = event.shiftKey

    dispatch(incrementSegmentWidth(position, false, precise, value))
  }

  /**
   * When given a new value from input, process it, then update the model.
   * Right now the data exists in two places: in Redux, and in the DOM.
   * Eventually we want to transition to fully Redux but while other parts
   * of the application still depends on DOM we must update both places at
   * the same time.
   *
   * If the input must be debounced, used the debounced function instead.
   *
   * @param {string} value - raw input
   */
  const updateModel = (value) => {
    const processedValue = processWidthInput(value, units)
    if (processedValue) {
      resizeSegment(position, RESIZE_TYPE_TYPING, processedValue, units)
    }
  }

  /**
   * Given a raw numerical value, format it and return a decorated string for when
   * the input is being edited.
   *
   * @param {Number} value - raw value
   * @returns {string} - a decorated value
   */
  const inputValueFormatter = (value) => {
    if (units === SETTINGS_UNITS_IMPERIAL) {
      const imperialValue = convertMetricMeasurementToImperial(value)
      return stringifyMeasurementValue(imperialValue, units, locale)
    } else {
      return stringifyMeasurementValue(value, units, locale)
    }
  }

  /**
   * Given a raw numerical value, format it and return a decorated string for display
   * when the input is not being edited.
   *
   * @param {Number} value - raw value
   * @returns {string} - a decorated value
   */
  const displayValueFormatter = (value) => {
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
          defaultMessage: 'Increase width (hold Shift for more precision)'
        })}
        downTooltip={intl.formatMessage({
          id: 'tooltip.decrease-width',
          defaultMessage: 'Decrease width (hold Shift for more precision)'
        })}
      />
    </div>
  )
}

export default WidthControl
