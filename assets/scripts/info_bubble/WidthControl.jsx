import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { changeSegmentWidth } from '../store/actions/street'
import { t } from '../app/locale'
import { trackEvent } from '../app/event_tracking'
import { KEYS } from '../app/keyboard_commands'

import { loseAnyFocus } from '../util/focus'
import {
  MIN_SEGMENT_WIDTH,
  MAX_SEGMENT_WIDTH,
  RESIZE_TYPE_TYPING,
  resizeSegment,
  incrementSegmentWidth,
  scheduleControlsFadeout
} from '../segments/resizing'
import {
  prettifyWidth,
  undecorateWidth,
  processWidthInput
} from '../util/width_units'

const WIDTH_EDIT_INPUT_DELAY = 200

class WidthControl extends React.Component {
  static propTypes = {
    touch: PropTypes.bool,
    segment: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
    segmentEl: PropTypes.object, // TODO: this is the actual DOM element; only here for legacy reasons
    position: PropTypes.number,
    value: PropTypes.number,
    changeSegmentWidth: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.oldValue = null
    this.timerId = -1
    this.inputEl = null

    this.state = {
      isEditing: false,
      displayValue: prettifyWidth(props.value)
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
        displayValue: prettifyWidth(nextProps.value)
      })
    }
  }

  /**
   * If UI is going to enter user-editing mode, immediately
   * save the previous value in case editing is cancelled
   *
   * @param {Object} nextProps
   * @param {Object} nextState
   */
  componentWillUpdate (nextProps, nextState) {
    if (!this.state.isEditing && nextState.isEditing) {
      this.oldValue = this.props.value
    }
  }

  onClickIncrement = (event) => {
    const segmentEl = this.props.segmentEl
    const precise = event.shiftKey

    // Legacy: normalize value and update DOM, then return the normalized value
    const newWidth = incrementSegmentWidth(segmentEl, true, precise, this.props.value)

    // Set new value in Redux
    this.props.changeSegmentWidth(this.props.position, newWidth)

    scheduleControlsFadeout(segmentEl)

    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'INCREMENT_BUTTON', null, true)
  }

  onClickDecrement = (event) => {
    const segmentEl = this.props.segmentEl
    const precise = event.shiftKey

    // Legacy: normalize value and update DOM, then return the normalized value
    const newWidth = incrementSegmentWidth(segmentEl, false, precise, this.props.value)

    // Set new value in Redux
    this.props.changeSegmentWidth(this.props.position, newWidth)

    scheduleControlsFadeout(segmentEl)

    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'INCREMENT_BUTTON', null, true)
  }

  onInput = (event) => {
    window.clearTimeout(this.timerId)

    const value = event.target.value

    // Update the input element to display user input
    this.setState({
      isEditing: true,
      displayValue: value
    })

    // However, there is a short delay between inputs and updating the model
    // to prevent rapid key entry from thrashing things
    const update = () => {
      const processedValue = processWidthInput(value)
      if (processedValue) {
        const normalizedValue = resizeSegment(this.props.segmentEl, RESIZE_TYPE_TYPING, processedValue, false, false)
        this.props.changeSegmentWidth(this.props.position, normalizedValue)
      }
    }

    this.timerId = window.setTimeout(update, WIDTH_EDIT_INPUT_DELAY)

    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'INPUT_FIELD', null, true)
  }

  onClickInput = (event) => {
    const el = event.target

    this.setState({
      isEditing: true,
      displayValue: undecorateWidth(this.props.value)
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
      displayValue: prettifyWidth(this.props.value)
    })
  }

  /**
   * Prevent mousedown event from resetting the input view.
   */
  onMouseDownInput = (event) => {
    this.setState({
      isEditing: true,
      displayValue: undecorateWidth(this.props.value)
    })
  }

  /**
   * On mouse over, UI assumes user is ready to edit.
   */
  onMouseOverInput = (event) => {
    // Bail if already in editing mode.
    if (this.state.isEditing) return

    this.setState({
      displayValue: undecorateWidth(this.props.value)
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
      displayValue: prettifyWidth(this.props.value)
    })

    event.target.blur()
  }

  onKeyDownInput = (event) => {
    switch (event.keyCode) {
      case KEYS.ENTER:
        const normalizedValue = resizeSegment(this.props.segmentEl, RESIZE_TYPE_TYPING, event.target.value, false, false)
        this.props.changeSegmentWidth(this.props.position, normalizedValue)

        this.setState({
          isEditing: false
        })

        this.inputEl.focus()
        this.inputEl.select()

        break
      case KEYS.ESC:
        this.props.changeSegmentWidth(this.props.position, this.oldValue)
        this.setBuildingFloorValue(this.props.position, this.oldValue)
        loseAnyFocus()
        break
    }
  }

  render () {
    const inputEl = (this.props.touch) ? (
      <span className="width-non-editable">
        {this.state.displayValue}
      </span>
    ) : (
      <input
        type="text"
        className="width"
        title={t('tooltip.segment-width', 'Change width of the segment')}
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
          title={t('tooltip.decrease-width', 'Decrease width (hold Shift for more precision)')}
          tabIndex={-1}
          onClick={this.onClickDecrement}
          disabled={this.state.value === MIN_SEGMENT_WIDTH}
        >
          –
        </button>
        {inputEl}
        <button
          className="increment"
          title={t('tooltip.increase-width', 'Increase width (hold Shift for more precision)')}
          tabIndex={-1}
          onClick={this.onClickIncrement}
          disabled={this.state.value === MAX_SEGMENT_WIDTH}
        >
          +
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
    value: (segment && segment.width) || null
  }
}

function mapDispatchToProps (dispatch) {
  return {
    changeSegmentWidth: (position, value) => { dispatch(changeSegmentWidth(position, value)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WidthControl)
