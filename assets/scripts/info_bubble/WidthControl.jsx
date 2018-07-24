import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { injectIntl, intlShape } from 'react-intl'
import { debounce } from 'lodash'
import { trackEvent } from '../app/event_tracking'
import { KEYS } from '../app/keyboard_commands'
import { loseAnyFocus } from '../util/focus'
import {
  MIN_SEGMENT_WIDTH,
  MAX_SEGMENT_WIDTH,
  RESIZE_TYPE_TYPING,
  resizeSegment,
  incrementSegmentWidth,
  resumeFadeoutControls
} from '../segments/resizing'
import {
  prettifyWidth,
  stringifyMeasurementValue,
  processWidthInput
} from '../util/width_units'

const WIDTH_EDIT_INPUT_DELAY = 200

class WidthControl extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    touch: PropTypes.bool,
    segment: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
    position: PropTypes.number,
    value: PropTypes.number,
    units: PropTypes.number,
    locale: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.oldValue = null
    this.inputEl = null

    this.state = {
      isEditing: false,
      displayValue: prettifyWidth(props.value, props.units)
    }
  }

  /**
   * If UI is not in user-editing mode, update the display
   * when the value in store changes
   *
   * @param {Object} nextProps
   */
  componentWillReceiveProps (nextProps) {
    if (!this.state.isEditing) {
      this.setState({
        displayValue: prettifyWidth(nextProps.value, nextProps.units)
      })
    }
  }

  /**
   * If UI is going to enter user-editing mode, immediately
   * save the previous value in case editing is cancelled
   *
   * @param {Object} prevProps
   * @param {Object} prevState
   */
  componentDidUpdate (prevProps, prevState) {
    if (!prevState.isEditing && this.state.isEditing) {
      this.oldValue = this.props.value
    }
  }

  onClickIncrement = (event) => {
    const precise = event.shiftKey

    incrementSegmentWidth(this.props.position, true, precise, this.props.value)
    resumeFadeoutControls()
    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'DECREMENT_BUTTON', null, true)
  }

  onClickDecrement = (event) => {
    const precise = event.shiftKey

    incrementSegmentWidth(this.props.position, false, precise, this.props.value)
    resumeFadeoutControls()
    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'INCREMENT_BUTTON', null, true)
  }

  onInput = (event) => {
    const value = event.target.value

    // Update the input element to display user input
    this.setState({
      isEditing: true,
      displayValue: value
    })

    // Update the model, but debounce inputs to prevent thrashing
    this.debouncedUpdateModel(value)

    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'INPUT_FIELD', null, true)
  }

  onClickInput = (event) => {
    const el = event.target

    this.setState({
      isEditing: true,
      displayValue: stringifyMeasurementValue(this.props.value, this.props.units, this.props.locale)
    })

    if (document.activeElement !== el) {
      el.select()
    }
  }

  onDoubleClickInput = (event) => {
    const el = event.target
    el.select()
  }

  onFocusInput = (event) => {
    const el = event.target

    if (document.activeElement !== el) {
      el.select()
    }
  }

  /**
   * On blur, input shows prettified width value.
   */
  onBlurInput = (event) => {
    this.setState({
      isEditing: false,
      displayValue: prettifyWidth(this.props.value, this.props.units)
    })
  }

  /**
   * Prevent mousedown event from resetting the input view.
   */
  onMouseDownInput = (event) => {
    this.setState({
      isEditing: true,
      displayValue: stringifyMeasurementValue(this.props.value, this.props.units, this.props.locale)
    })
  }

  /**
   * On mouse over, UI assumes user is ready to edit.
   */
  onMouseOverInput = (event) => {
    // Bail if already in editing mode.
    if (this.state.isEditing) return

    this.setState({
      displayValue: stringifyMeasurementValue(this.props.value, this.props.units, this.props.locale)
    })

    // Automatically select the value on hover so that it's easy to start typing new values.
    // In React, this only works if the .select() is called at the end of the execution
    // stack, so we put it inside a setTimeout() with a timeout of zero. We also must
    // store the reference to the event target because the React synthetic event will
    // not persist into the setTimeout function.
    const target = event.target
    window.setTimeout(() => {
      target.focus()
      target.select()
    }, 0)
  }

  /**
   * On mouse out, if user is not editing, UI returns to default view.
   */
  onMouseOutInput = (event) => {
    // Bail if already in editing mode.
    if (this.state.isEditing) return

    this.setState({
      displayValue: prettifyWidth(this.props.value, this.props.units)
    })

    event.target.blur()
  }

  onKeyDownInput = (event) => {
    switch (event.keyCode) {
      case KEYS.ENTER:
        this.updateModel(event.target.value)

        this.setState({
          isEditing: false
        })

        this.inputEl.focus()
        this.inputEl.select()

        break
      // TODO: this is bugged; escape key is not firing currently
      case KEYS.ESC:
        this.updateModel(this.oldValue)
        loseAnyFocus()
        break
    }
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
      resizeSegment(this.props.position, RESIZE_TYPE_TYPING, processedValue)
    }
  }

  /**
   * Debounced version of this.updateModel(). Call this instead of the
   * undebounced function to prevent thrashing of model and layout.
   */
  debouncedUpdateModel = debounce(this.updateModel, WIDTH_EDIT_INPUT_DELAY)

  render () {
    const inputEl = (this.props.touch) ? (
      <span className="width-non-editable">
        {this.state.displayValue}
      </span>
    ) : (
      <input
        type="text"
        className="width"
        title={this.props.intl.formatMessage({ id: 'tooltip.segment-width', defaultMessage: 'Change width of the segment' })}
        value={this.state.displayValue}
        onChange={this.onInput}
        onClick={this.onClickInput}
        onDoubleClick={this.onDoubleClickInput}
        onFocus={this.onFocusInput}
        onBlur={this.onBlurInput}
        onMouseDown={this.onMouseDownInput}
        onMouseOver={this.onMouseOverInput}
        onMouseOut={this.onMouseOutInput}
        onKeyDown={this.onKeyDownInput}
        ref={(ref) => { this.inputEl = ref }}
      />
    )

    return (
      <div className="non-variant">
        <button
          className="decrement"
          title={this.props.intl.formatMessage({ id: 'tooltip.decrease-width', defaultMessage: 'Decrease width (hold Shift for more precision)' })}
          tabIndex={-1}
          onClick={this.onClickDecrement}
          disabled={this.props.value <= MIN_SEGMENT_WIDTH}
        >
          <FontAwesomeIcon icon="minus" />
        </button>
        {inputEl}
        <button
          className="increment"
          title={this.props.intl.formatMessage({ id: 'tooltip.increase-width', defaultMessage: 'Increase width (hold Shift for more precision)' })}
          tabIndex={-1}
          onClick={this.onClickIncrement}
          disabled={this.props.value >= MAX_SEGMENT_WIDTH}
        >
          <FontAwesomeIcon icon="plus" />
        </button>
      </div>
    )
  }
}

function mapStateToProps (state, ownProps) {
  const segment = state.street.segments[ownProps.position]
  return {
    touch: state.system.touch,
    segment: segment,
    value: (segment && segment.width) || null,
    units: state.street.units,
    locale: state.locale.locale
  }
}

export default injectIntl(connect(mapStateToProps)(WidthControl))
