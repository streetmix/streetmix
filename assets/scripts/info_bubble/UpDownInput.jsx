import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_MINUS, ICON_PLUS } from '../ui/icons'
import './UpDownInput.scss'

const EDIT_INPUT_DELAY = 200

UpDownInput.propTypes = {
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

  // Tooltip text
  inputTooltip: PropTypes.string,
  upTooltip: PropTypes.string,
  downTooltip: PropTypes.string,

  // If enabled, allow auto-update of values during input. This can
  // currently cause buggy and unexpected behavior, so it's disabled
  // by default.
  allowAutoUpdate: PropTypes.bool
}

function UpDownInput (props) {
  // Destructure props with default values
  const {
    value,
    minValue,
    maxValue,
    inputValueFormatter = (value) => value,
    displayValueFormatter = (value) => value,
    onClickUp = () => {},
    onClickDown = () => {},
    onUpdatedValue = () => {},
    disabled = false,
    inputTooltip = 'Change value',
    upTooltip = 'Increment',
    downTooltip = 'Decrement',
    allowAutoUpdate = false
  } = props

  const oldValue = useRef(null)
  const inputEl = useRef()

  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // If the initial `value` prop is `null` or undefined, the displayValue must
  // be initiated as an empty string, otherwise React throws a warning about
  // uncontrolled inputs when the value is changed later
  // The display value is not necessarily the same as the raw `value`. It is
  // usually the "pretty" formatted value.
  const [displayValue, setDisplayValue] = useState(value ?? '')

  // This is the "dirty" user input value. This should be the input value when
  // it's set, otherwise display the formatted `displayValue`. This can be an
  // empty string, which is always valid user input.
  const [userInputValue, setUserInputValue] = useState(null)

  // If `allowAutoUpdate` is true, input updates call onUpdatedValue handler
  // after a debounced amount of time. This can cause unexpected and buggy
  // behavior right now because it seems that updating the value can reset the
  // `isEditing` state internally, which makes it really hard for the user to
  // use the text input element. TODO: look into what causes this!
  const debounceUpdateValue = debounce(onUpdatedValue, EDIT_INPUT_DELAY)

  // Depending on what happens, set the display value of the <input> element.
  useEffect(() => {
    // If component is disabled, display nothing
    if (disabled) {
      setDisplayValue('')
      return
    }

    // If the `value` prop is `null` or undefined, display nothing
    if (value === null || typeof value === 'undefined') {
      setDisplayValue('')
      return
    }

    // If input is being edited (or hovered, which displays its "raw" value),
    // display the value without units. The `inputValueFormatter` function is
    // run, which takes into account the user's preferred units.
    if (isEditing || isHovered) {
      if (userInputValue !== null) {
        // If there is user input, always display that.
        setDisplayValue(userInputValue)
      } else {
        // Otherwise, display the value from props
        setDisplayValue(inputValueFormatter(value))
      }
      return
    }

    // In all other cases, display the "prettified" value inside the input,
    // which is the "raw" value formatted using the correct unit conversion
    // and unit label.
    setDisplayValue(displayValueFormatter(value))
  }, [
    value,
    userInputValue,
    disabled,
    isEditing,
    isHovered,
    inputValueFormatter,
    displayValueFormatter
  ])

  /**
   * If UI is going to enter user-editing mode, immediately
   * save the previous value in case editing is cancelled
   */
  useEffect(() => {
    if (isEditing === true) {
      oldValue.current = value
    } else {
      // reset dirty `userInputValue`
      setUserInputValue(null)
    }
    // We only want to save the old value once, not every time it changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing])

  function handleClickIncrement (event) {
    setIsEditing(false)
    onClickUp(event)
  }

  function handleClickDecrement (event) {
    setIsEditing(false)
    onClickDown(event)
  }

  function handleInputClick (event) {
    // Bail if already in editing mode.
    if (isEditing) return

    setIsEditing(true)
  }

  /**
   * Somehow, the double-click to select all text is broken, so this
   * manually puts it back
   */
  function handleInputDoubleClick (event) {
    event.target.select()
  }

  function handleInputChange (event) {
    const value = event.target.value

    // Update the input element to display user input
    setUserInputValue(value)

    // Send the value to the parent's handler function
    // using the debounced version of `onUpdatedValue`
    if (allowAutoUpdate) {
      debounceUpdateValue(value)
    }
  }

  function handleInputBlur (event) {
    setIsHovered(false)
    setIsEditing(false)

    if (!allowAutoUpdate) {
      onUpdatedValue(event.target.value)
    }
  }

  /**
   * Necessary to prevent blur event from being called on a mousedown(?)
   * The observed effect is that if a user is editing/focused on the input,
   * and they click on it again, the blur event handler is called and the
   * input value momentarily changes to the unblurred (prettified) value.
   * Not sure what causes this, but this handler fixes that issue.
   */
  function handleInputMouseDown (event) {
    // Bail if already in editing mode.
    if (isEditing) return

    setIsEditing(true)
  }

  /**
   * On mouse over, UI assumes user is ready to edit.
   */
  function handleInputMouseOver (event) {
    // Bail if already in editing mode.
    if (isEditing) return

    setIsHovered(true)

    // Automatically select the value on hover so that it's easy to start
    // typing new values. In React, this only works if the .select() is called
    // at the end of the execution stack, so we put it inside a setTimeout()
    // with a timeout of zero. We also must store the reference to the event
    // target because the React synthetic event will not persist into the
    // `setTimeout` function.
    const target = event.target
    window.setTimeout(() => {
      target.focus()
      target.select()
    }, 0)
  }

  /**
   * On mouse out, if user is not editing, UI returns to default view.
   */
  function handleInputMouseOut (event) {
    // Bail if already in editing mode.
    if (isEditing) return

    // On mouse out, we want to blur but the onBlur handler is not
    // called in a test environment. Just in case, we also reset the
    // the isHovered and isEditing state here.
    setIsHovered(false)
    setIsEditing(false)

    event.target.blur()

    if (!allowAutoUpdate) {
      onUpdatedValue(event.target.value)
    }
  }

  function handleInputKeyDown (event) {
    switch (event.key) {
      case 'Enter':
        onUpdatedValue(event.target.value)

        setIsEditing(false)

        inputEl.current.focus()
        inputEl.current.select()

        break
      case 'Esc': // IE/Edge specific value
      case 'Escape':
        // Lose focus from input but place focus on body
        inputEl.current.blur()
        document.body.focus()

        // Reset editing or hover state
        setIsEditing(false)
        setIsHovered(false)

        onUpdatedValue(oldValue.current)
        break
    }
  }

  return (
    <div className="up-down-input">
      <button
        className="up-down-input-decrement"
        title={downTooltip}
        tabIndex={-1}
        onClick={handleClickDecrement}
        disabled={disabled || (minValue ? value <= minValue : false)}
      >
        <FontAwesomeIcon icon={ICON_MINUS} />
      </button>
      <input
        type="text"
        className="up-down-input-element"
        title={inputTooltip}
        disabled={disabled}
        value={displayValue}
        onChange={handleInputChange}
        onClick={handleInputClick}
        onDoubleClick={handleInputDoubleClick}
        onBlur={handleInputBlur}
        onMouseDown={handleInputMouseDown}
        onMouseOver={handleInputMouseOver}
        onMouseOut={handleInputMouseOut}
        onKeyDown={handleInputKeyDown}
        ref={inputEl}
      />
      <button
        className="up-down-input-increment"
        title={upTooltip}
        tabIndex={-1}
        onClick={handleClickIncrement}
        disabled={disabled || (maxValue ? value >= maxValue : false)}
      >
        <FontAwesomeIcon icon={ICON_PLUS} />
      </button>
    </div>
  )
}

export default UpDownInput
