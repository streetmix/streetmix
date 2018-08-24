import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { KEYS } from '../app/keyboard_commands'

export default class UpDownInput extends React.Component {
  static propTypes = {
    value: PropTypes.number,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    displayValueFormatter: PropTypes.func,

    onClickUp: PropTypes.func,
    onClickDown: PropTypes.func,
    onUpdatedValue: PropTypes.func,

    disabled: PropTypes.bool,
    touch: PropTypes.bool,
    inputLabel: PropTypes.string,
    upLabel: PropTypes.string,
    downLabel: PropTypes.string
  }

  static defaultProps = {
    displayValueFormatter: (value) => value,
    onClickUp: () => {},
    onClickDown: () => {},
    onUpdatedValue: () => {},
    disabled: false,
    touch: false,
    inputLabel: 'Change value',
    upLabel: 'Increment',
    downLabel: 'Decrement'
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
    this.props.onUpdatedValue(value)
  }

  handleInputClick = (event) => {
    const el = event.target

    this.setState({
      isEditing: true,
      displayValue: this.props.value
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
      displayValue: this.props.value
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
      displayValue: this.props.value
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
      <span className="height-non-editable">{this.state.displayValue}</span>
    ) : (
      <input
        type="text"
        className="height"
        title={this.props.inputLabel}
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

  render () {
    return (
      <React.Fragment>
        <button
          className="increment"
          title={this.props.upLabel}
          tabIndex={-1}
          onClick={this.handleClickIncrement}
          disabled={this.props.disabled || (this.props.value >= this.props.maxValue)}
        >
          <FontAwesomeIcon icon="plus" />
        </button>

        {this.renderInputEl()}

        <button
          className="decrement"
          title={this.props.downLabel}
          tabIndex={-1}
          onClick={this.handleClickDecrement}
          disabled={this.props.disabled || (this.props.value <= this.props.minValue)}
        >
          <FontAwesomeIcon icon="minus" />
        </button>
      </React.Fragment>
    )
  }
}
