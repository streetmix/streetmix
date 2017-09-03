import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { msg } from '../app/messages'
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
    enabled: PropTypes.bool,
    touch: PropTypes.bool,
    segment: PropTypes.object // TODO: this is the actual DOM element; change it to a value
  }

  static defaultProps = {
    enabled: false
  }

  constructor (props) {
    super(props)

    this.oldValue = null
    this.held = false
    this.timerId = -1
    this.inputEl = null

    this.state = {
      value: null,
      displayValue: ''
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

    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'INCREMENT_BUTTON', null, true)
  }

  onClickWidthIncrement = (event) => {
    const segmentEl = this.props.segment
    const precise = event.shiftKey

    incrementSegmentWidth(segmentEl, true, precise)
    scheduleControlsFadeout(segmentEl)

    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'INCREMENT_BUTTON', null, true)
  }

  onInput = (event) => {
    this._widthEditInputChanged(event.target, false)

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
    // Read actual width from segment, because width is normalized there.
    const value = this.getWidthFromSegment()
    this.setState({
      value: value,
      displayValue: prettifyWidth(value)
    })

    this.held = false
  }

  onMouseOverInput = (event) => {
    if (!this.held) {
      event.target.focus()
      event.target.select() // This is usually broken in React for some reason
    }
  }

  onMouseOutInput = (event) => {
    if (!this.held) {
      event.target.blur()
    }
  }

  onKeyDownInput = (event) => {
    var el = event.target

    switch (event.keyCode) {
      case KEYS.ENTER:
        this._widthEditInputChanged(el, true)
        el.focus()
        el.select()
        break
      case KEYS.ESC:
        this.setState({
          displayValue: this.oldValue
        })
        this._widthEditInputChanged(el, true)
        this.inputEl.blur()
        break
    }
  }

  /**
   * Any time the width input changes, run it through `resizeSegment()`
   */
  _widthEditInputChanged (el, immediate = true) {
    window.clearTimeout(this.timerId)

    const inputValue = el.value

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
    return undecorateWidth(parseFloat(segmentEl.getAttribute('data-width')))
  }

  render () {
    if (this.props.enabled === false) return null

    let widthClassName = 'non-variant'
    // if (!segmentInfo.variants[0]) widthClassName += ' entire-info-bubble'

    const inputEl = (this.props.touch === false) ? (
      <input
        type="text"
        className="width"
        title={msg('TOOLTIP_SEGMENT_WIDTH')}
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
    ) : (
      <span className="width-non-editable" />
    )

    return (
      <div className={widthClassName}>
        <button
          className="decrement"
          title={msg('TOOLTIP_DECREASE_WIDTH')}
          tabIndex={-1}
          onClick={this.onClickWidthDecrement}
        >
          –
        </button>
        {inputEl}
        <button
          className="increment"
          title={msg('TOOLTIP_INCREASE_WIDTH')}
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
