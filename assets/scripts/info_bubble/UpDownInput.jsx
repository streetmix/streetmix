import React from 'react'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { KEYS } from '../app/keys'
import { ICON_MINUS, ICON_PLUS } from '../ui/icons'
import './UpDownInput.scss'

const EDIT_INPUT_DELAY = 200

export default class UpDownInput extends React.Component {
  static propTypes = {
    // Raw input value must always be a number type which can be
    // compared with the minValue and maxValue.
    value: PropTypes.number,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,

    // Formatter functions are used to optionally format raw values
    // for display. These functions should return a number or a string.

    // `inputValueFormatter` formats a value that is displayed when
    // a user has focused or hovered over the <input> element. If this
    // function is unspecified, the display value remains the raw
    // `value` prop.
    inputValueFormatter: PropTypes.func,

    // `displayValueFormatter` formats a value that is displayed inside
    // the <input> element when it is not being edited. If this
    // function is unspecified, the display value remains the raw
    // `value` prop.
    displayValueFormatter: PropTypes.func,

    // Handler functions are specified by the parent component. These
    // handlers should be responsible for validating raw inputs and
    // updating street data.
    onClickUp: PropTypes.func,
    onClickDown: PropTypes.func,
    onUpdatedValue: PropTypes.func,

    // When `true`, the input box and buttons are disabled
    disabled: PropTypes.bool,

    // When `true`, displays a non-editable <span> instead of an <input>
    touch: PropTypes.bool,

    // Tooltip text
    inputTooltip: PropTypes.string,
    upTooltip: PropTypes.string,
    downTooltip: PropTypes.string
  }

  static defaultProps = {
    inputValueFormatter: (value) => value,
    displayValueFormatter: (value) => value,
    onClickUp: () => {},
    onClickDown: () => {},
    onUpdatedValue: () => {},
    disabled: false,
    touch: false,
    inputTooltip: 'Change value',
    upTooltip: 'Increment',
    downTooltip: 'Decrement'
  }

  constructor (props) {
    super(props)

    this.oldValue = null
    this.inputEl = React.createRef()

    this.state = {
      isEditing: false,
      isHovered: false,
      displayValue: null
    }

    // Debounce `props.onUpdatedValue` to prevent rapid input changes from thrashing data
    this.debounceUpdateValue = debounce(props.onUpdatedValue, EDIT_INPUT_DELAY)
  }

  /**
   * If UI is not in user-editing mode, update the display
   * when the value in store changes
   *
   * @param {Object} nextProps
   */
  static getDerivedStateFromProps (nextProps, prevState) {
    if (!prevState.isEditing && !prevState.isHovered) {
      return {
        displayValue: nextProps.displayValueFormatter(nextProps.value)
      }
    }

    return {
      value: nextProps.value
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
      this.oldValue = prevProps.value
    }
  }

  handleClickIncrement = (event) => {
    this.props.onClickUp(event)
  }

  handleClickDecrement = (event) => {
    this.props.onClickDown(event)
  }

  handleInputChange = (event) => {
    const value = event.target.value

    // Update the input element to display user input
    this.setState({
      isEditing: true,
      displayValue: value
    })

    // Send the value to the parent's handler function
    // using the debounced version of `props.onUpdatedValue`
    this.debounceUpdateValue(value)
  }

  handleInputClick = (event) => {
    const el = event.target

    this.setState({
      isEditing: true,
      displayValue: this.props.inputValueFormatter(this.props.value)
    })

    if (document.activeElement !== el) {
      el.select()
    }
  }

  handleInputDoubleClick = (event) => {
    const el = event.target
    el.select()
  }

  handleInputFocus = (event) => {
    const el = event.target

    if (document.activeElement !== el) {
      el.select()
    }
  }

  /**
   * On blur, input shows prettified value.
   */
  handleInputBlur = (event) => {
    this.setState({
      isEditing: false,
      displayValue: this.props.displayValueFormatter(this.props.value)
    })
  }

  /**
   * Prevent mousedown event from resetting the input view.
   */
  handleInputMouseDown = (event) => {
    this.setState({
      isEditing: true,
      displayValue: this.props.inputValueFormatter(this.props.value)
    })
  }

  /**
   * On mouse over, UI assumes user is ready to edit.
   */
  handleInputMouseOver = (event) => {
    // Bail if already in editing mode.
    if (this.state.isEditing) return

    this.setState({
      isHovered: true,
      displayValue: this.props.inputValueFormatter(this.props.value)
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
  handleInputMouseOut = (event) => {
    // Bail if already in editing mode.
    if (this.state.isEditing) return

    this.setState({
      isHovered: false,
      displayValue: this.props.displayValueFormatter(this.props.value)
    })

    event.target.blur()
  }

  handleInputKeyDown = (event) => {
    switch (event.keyCode) {
      case KEYS.ENTER:
        this.props.onUpdatedValue(event.target.value)

        this.setState({
          isEditing: false
        })

        this.inputEl.current.focus()
        this.inputEl.current.select()

        break
      case KEYS.ESC:
        // Lose focus from input but place focus on body
        this.inputEl.current.blur()
        document.body.focus()

        // Reset editing or hover state
        this.setState({
          isEditing: false,
          isHovered: false
        })

        this.props.onUpdatedValue(this.oldValue)
        break
    }
  }

  renderInputEl = () => {
    return (this.props.touch) ? (
      <span className="up-down-input-element up-down-input-uneditable">
        {this.state.displayValue}
      </span>
    ) : (
      <input
        type="text"
        className="up-down-input-element"
        title={this.props.inputTooltip}
        disabled={this.props.disabled}
        value={this.props.disabled ? '' : this.state.displayValue}
        onChange={this.handleInputChange}
        onClick={this.handleInputClick}
        onDoubleClick={this.handleInputDoubleClick}
        onFocus={this.handleInputFocus}
        onBlur={this.handleInputBlur}
        onMouseDown={this.handleInputMouseDown}
        onMouseOver={this.handleInputMouseOver}
        onMouseOut={this.handleInputMouseOut}
        onKeyDown={this.handleInputKeyDown}
        ref={this.inputEl}
      />
    )
  }

  /**
   * @todo make minValue and maxValue optional
   */
  render () {
    return (
      <React.Fragment>
        <button
          className="up-down-input-decrement"
          title={this.props.downTooltip}
          tabIndex={-1}
          onClick={this.handleClickDecrement}
          disabled={this.props.disabled || (this.props.value <= this.props.minValue)}
        >
          <FontAwesomeIcon icon={ICON_MINUS} />
        </button>

        {this.renderInputEl()}

        <button
          className="up-down-input-increment"
          title={this.props.upTooltip}
          tabIndex={-1}
          onClick={this.handleClickIncrement}
          disabled={this.props.disabled || (this.props.value >= this.props.maxValue)}
        >
          <FontAwesomeIcon icon={ICON_PLUS} />
        </button>
      </React.Fragment>
    )
  }
}
