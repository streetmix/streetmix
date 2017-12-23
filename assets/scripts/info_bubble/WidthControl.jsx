import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { t } from '../app/locale'
import { trackEvent } from '../app/event_tracking'
import { KEYS } from '../app/keyboard_commands'

import {
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
import { TILE_SIZE } from '../segments/view'
import { infoBubble } from './info_bubble'

const WIDTH_EDIT_INPUT_DELAY = 200

class WidthControl extends React.Component {
  static propTypes = {
    touch: PropTypes.bool,
    segment: PropTypes.object // TODO: this is the actual DOM element; change it to a value
  }

  constructor (props) {
    super(props)

    this.oldValue = null
    this.held = false
    this.timerId = -1
    this.inputEl = null

    const width = this.getWidthFromSegment(props.segment)

    this.state = {
      value: width,
      displayValue: prettifyWidth(width)
    }
  }

  componentWillReceiveProps (nextProps) {
    const width = this.getWidthFromSegment(nextProps.segment)
    this.setState({
      value: width,
      displayValue: prettifyWidth(width)
    })

    this.held = false

    // `inputEl` is null if this component is disabled
    if (this.inputEl) {
      this.inputEl.blur()
    }
  }

  onClickWidthDecrement = (event) => {
    const segmentEl = this.props.segment
    const precise = event.shiftKey

    incrementSegmentWidth(segmentEl, false, precise)
    scheduleControlsFadeout(segmentEl)

    this.updateWidthFromSegment()

    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'INCREMENT_BUTTON', null, true)
  }

  onClickWidthIncrement = (event) => {
    const segmentEl = this.props.segment
    const precise = event.shiftKey

    incrementSegmentWidth(segmentEl, true, precise)
    scheduleControlsFadeout(segmentEl)

    this.updateWidthFromSegment()

    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'INCREMENT_BUTTON', null, true)
  }

  onInput = (event) => {
    this._widthEditInputChanged(event.target.value, false)

    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'INPUT_FIELD', null, true)
  }

  onClickInput = (event) => {
    const el = event.target
    this.held = true

    if (document.activeElement !== el) {
      el.select()
    }
  }

  onFocusInput = (event) => {
    this.oldValue = this.state.value
    this.setState({
      displayValue: undecorateWidth(this.state.value)
    })
  }

  /**
   * On blur, input shows prettified width value.
   */
  onBlurInput = (event) => {
    this.updateWidthFromSegment()
    this.held = false
  }

  /* same as BuildingHeightControl */
  onMouseOverInput = (event) => {
    if (!this.held) {
      event.target.focus()
      event.target.select() // This is usually broken in React for some reason
    }
  }

  /* same as BuildingHeightControl */
  onMouseOutInput = (event) => {
    if (!this.held) {
      event.target.blur()
    }
  }

  onKeyDownInput = (event) => {
    switch (event.keyCode) {
      case KEYS.ENTER:
        this._widthEditInputChanged(event.target.value, true)
        this.inputEl.focus()
        this.inputEl.select()
        break
      case KEYS.ESC:
        this.setState({
          displayValue: this.oldValue
        })
        this._widthEditInputChanged(event.target.value, true)
        this.inputEl.blur()
        break
    }
  }

  /**
   * Any time the width input changes, run it through `resizeSegment()`
   */
  _widthEditInputChanged (inputValue, immediate = true) {
    window.clearTimeout(this.timerId)

    this.setState({
      displayValue: inputValue
    })

    const width = processWidthInput(inputValue)

    if (width) {
      const update = () => {
        resizeSegment(this.props.segment, RESIZE_TYPE_TYPING, width * TILE_SIZE, false, false)
        infoBubble.updateWidthButtonsInContents(width)
        this.setState({
          value: this.getWidthFromSegment()
        })
      }

      if (immediate) {
        update()
      } else {
        this.timerId = window.setTimeout(update, WIDTH_EDIT_INPUT_DELAY)
      }
    }
  }

  /**
   * Changes to width are run through `resizeSegment()` which normalizes
   * inputs, corrects for units, rounds strange decimals, etc. As a result,
   * when we update state, read the actual value from the segment element.
   */
  getWidthFromSegment = (el) => {
    const segmentEl = el || this.props.segment
    return parseFloat(segmentEl.getAttribute('data-width'))
  }

  // Read actual width from segment, because width is normalized there.
  // This is temporary while we transition to React/Redux
  updateWidthFromSegment = (el) => {
    const value = this.getWidthFromSegment()
    this.setState({
      value: value,
      displayValue: prettifyWidth(value)
    })
  }

  render () {
    let widthClassName = 'non-variant'
    // if (!segmentInfo.variants[0]) widthClassName += ' entire-info-bubble'

    const inputEl = (this.props.touch) ? (
      <span className="width-non-editable" />
    ) : (
      <input
        type="text"
        className="width"
        title={t('tooltip.segment-width', 'Change width of the segment')}
        value={this.state.displayValue}
        onChange={this.onInput}
        onClick={this.onClickInput}
        onFocus={this.onFocusInput}
        onBlur={this.onBlurInput}
        onMouseOver={this.onMouseOverInput}
        onMouseOut={this.onMouseOutInput}
        onKeyDown={this.onKeyDownInput}
        ref={(ref) => { this.inputEl = ref }}
      />
    )

    return (
      <div className={widthClassName}>
        <button
          className="decrement"
          title={t('tooltip.decrease-width', 'Decrease width (hold Shift for more precision)')}
          tabIndex={-1}
          onClick={this.onClickWidthDecrement}
        >
          –
        </button>
        {inputEl}
        <button
          className="increment"
          title={t('tooltip.increase-width', 'Increase width (hold Shift for more precision)')}
          tabIndex={-1}
          onClick={this.onClickWidthIncrement}
        >
          +
        </button>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    touch: state.system.touch
  }
}

export default connect(mapStateToProps)(WidthControl)
