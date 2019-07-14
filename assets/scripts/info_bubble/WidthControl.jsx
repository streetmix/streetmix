import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl, intlShape } from 'react-intl'
import UpDownInput from './UpDownInput'
import { trackEvent } from '../app/event_tracking'
import {
  MIN_SEGMENT_WIDTH,
  MAX_SEGMENT_WIDTH
} from '../segments/constants'
import {
  incrementSegmentWidth
} from '../store/actions/street'
import {
  RESIZE_TYPE_TYPING,
  resizeSegment,
  resumeFadeoutControls
} from '../segments/resizing'
import {
  prettifyWidth,
  stringifyMeasurementValue,
  processWidthInput
} from '../util/width_units'

class WidthControl extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    touch: PropTypes.bool,
    position: PropTypes.number,
    value: PropTypes.number,
    units: PropTypes.number,
    locale: PropTypes.string,
    // provided by store
    incrementSegmentWidth: PropTypes.func
  }

  handleIncrement = (event) => {
    const precise = event.shiftKey

    this.props.incrementSegmentWidth(true, precise, this.props.value)
    resumeFadeoutControls()
    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'DECREMENT_BUTTON', null, true)
  }

  handleDecrement = (event) => {
    const precise = event.shiftKey

    this.props.incrementSegmentWidth(false, precise, this.props.value)
    resumeFadeoutControls()
    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'INCREMENT_BUTTON', null, true)
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
  updateModel = (value) => {
    const processedValue = processWidthInput(value, this.props.units)
    if (processedValue) {
      resizeSegment(this.props.position, RESIZE_TYPE_TYPING, processedValue, this.props.units)
    }
  }

  /**
   * Given a raw numerical value, format it and return a decorated string for when
   * the input is being edited.
   *
   * @param {Number} value - raw value
   * @returns {string} - a decorated value
   */
  inputValueFormatter = (value) => {
    return stringifyMeasurementValue(value, this.props.units, this.props.locale)
  }

  /**
   * Given a raw numerical value, format it and return a decorated string for display
   * when the input is not being edited.
   *
   * @param {Number} value - raw value
   * @returns {string} - a decorated value
   */
  displayValueFormatter = (value) => {
    return prettifyWidth(value, this.props.units)
  }

  render () {
    return (
      <div className="non-variant">
        <UpDownInput
          value={this.props.value}
          minValue={MIN_SEGMENT_WIDTH}
          maxValue={MAX_SEGMENT_WIDTH}
          inputValueFormatter={this.inputValueFormatter}
          displayValueFormatter={this.displayValueFormatter}
          onClickUp={this.handleIncrement}
          onClickDown={this.handleDecrement}
          onUpdatedValue={this.updateModel}
          inputTooltip={this.props.intl.formatMessage({
            id: 'tooltip.segment-width',
            defaultMessage: 'Change width of the segment'
          })}
          upTooltip={this.props.intl.formatMessage({
            id: 'tooltip.increase-width',
            defaultMessage: 'Increase width (hold Shift for more precision)'
          })}
          downTooltip={this.props.intl.formatMessage({
            id: 'tooltip.decrease-width',
            defaultMessage: 'Decrease width (hold Shift for more precision)'
          })}
          touch={this.props.touch}
        />
      </div>
    )
  }
}

function mapStateToProps (state, ownProps) {
  const segment = state.street.segments[ownProps.position]
  return {
    touch: state.system.touch,
    value: (segment && segment.width) || null,
    units: state.street.units,
    locale: state.locale.locale
  }
}
function mapDispatchToProps (dispatch, ownProps) {
  return {
    incrementSegmentWidth: (add, precise, value) => dispatch(incrementSegmentWidth(ownProps.position, add, precise, value))
  }
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(WidthControl))
