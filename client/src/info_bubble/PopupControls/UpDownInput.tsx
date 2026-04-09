import { useRef, useState, useEffect } from 'react'
import debounce from 'just-debounce-it'

import { Button } from '~/src/ui/Button.js'
import { Icon } from '~/src/ui/Icon.js'
import { Tooltip } from '~/src/ui/Tooltip.js'
import './UpDownInput.css'

const EDIT_INPUT_DELAY = 200

interface UpDownInputProps {
  // Raw input value must always be a number type which can be
  // compared with the minValue and maxValue. Can be null.
  value: number | null
  minValue?: number
  maxValue?: number

  // Formatter functions are used to optionally format raw values
  // for display. These functions should return a number or a string.

  // `inputValueFormatter` formats a value that is displayed when
  // a user has focused or hovered over the <input> element. If this
  // function is unspecified, the display value remains the raw
  // `value` prop.
  inputValueFormatter?: (value: number) => string

  // `displayValueFormatter` formats a value that is displayed inside
  // the <input> element when it is not being edited. If this
  // function is unspecified, the display value remains the raw
  // `value` prop.
  displayValueFormatter?: (value: number) => string

  // Handler functions are specified by the parent component. These
  // handlers should be responsible for validating raw inputs and
  // updating street data.
  onClickUp?: React.MouseEventHandler
  onClickDown?: React.MouseEventHandler
  onUpdatedValue?: (value: string) => void

  // When `true`, the input box and buttons are disabled
  disabled?: boolean

  // Tooltip text
  inputTooltip?: string
  upTooltip?: string
  downTooltip?: string
  upTooltipSublabel?: string
  downTooltipSublabel?: string

  // If enabled, allow auto-update of values during input. This can
  // currently cause buggy and unexpected behavior, so it's disabled
  // by default.
  allowAutoUpdate?: boolean
}

export function UpDownInput(props: UpDownInputProps) {
  // Destructure props with default values
  const {
    value,
    minValue,
    maxValue,
    inputValueFormatter = (value) => (value ?? '').toString(),
    displayValueFormatter = (value) => (value ?? '').toString(),
    onClickUp = () => {},
    onClickDown = () => {},
    onUpdatedValue = () => {},
    disabled = false,
    inputTooltip = 'Change value',
    upTooltip = 'Increment',
    downTooltip = 'Decrement',
    upTooltipSublabel,
    downTooltipSublabel,
    allowAutoUpdate = false,
  } = props

  const oldValue = useRef<string | null>(null)
  const inputEl = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // If the initial `value` prop is `null`, displayValue must be initiated
  // as an empty string, otherwise React throws a warning about uncontrolled
  // inputs when the value is changed later
  // The display value is not necessarily the same as the raw `value`. It is
  // usually the "pretty" formatted value.
  const [displayValue, setDisplayValue] = useState<string>(
    (value ?? '').toString()
  )

  // This is the "dirty" user input value. This should be the input value when
  // it's set, otherwise display the formatted `displayValue`. This can be an
  // empty string, which is always valid user input.
  const [userInputValue, setUserInputValue] = useState<string>('')

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

    // If the `value` prop is `null`, display nothing
    if (value === null) {
      setDisplayValue('')
      return
    }

    // If input is being edited, always display user input value
    if (isEditing) {
      setDisplayValue(userInputValue)
      return
    }

    // If input is being hovered, display the value without units, using
    // `inputValueFormatter`, which accounts for the user's preferred units.
    if (isHovered) {
      setDisplayValue((inputValueFormatter(value) ?? '').toString())
      return
    }

    // In all other cases, display the "prettified" value inside the input,
    // which is the "raw" value formatted using the correct unit conversion
    // and unit label.
    setDisplayValue((displayValueFormatter(value) ?? '').toString())
  }, [
    value,
    userInputValue,
    disabled,
    isEditing,
    isHovered,
    inputValueFormatter,
    displayValueFormatter,
  ])

  /**
   * If UI is going to enter user-editing mode, immediately
   * save the previous value in case editing is cancelled
   */
  useEffect(() => {
    if (isEditing) {
      oldValue.current = (value ?? '').toString()
    } else {
      // Reset dirty `userInputValue`
      setUserInputValue('')
    }
    // We only want to save the old value once, not every time it changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing])

  function handleClickIncrement(event: React.MouseEvent): void {
    setIsEditing(false)
    onClickUp(event)
  }

  function handleClickDecrement(event: React.MouseEvent): void {
    setIsEditing(false)
    onClickDown(event)
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value

    // Update the input element to display user input
    setUserInputValue(value)

    // Send the value to the parent's handler function
    // using the debounced version of `onUpdatedValue`
    if (allowAutoUpdate) {
      debounceUpdateValue(value)
    }
  }

  function handleInputFocus(event: React.ChangeEvent<HTMLInputElement>): void {
    // When we begin editing, set the initial user input value to current
    setUserInputValue(value === null ? '' : inputValueFormatter(value))
    setIsEditing(true)

    const target = event.target as HTMLInputElement
    window.setTimeout(() => {
      target.select()
    }, 10)
  }

  function handleInputBlur(event: React.FocusEvent<HTMLInputElement>): void {
    setIsHovered(false)
    setIsEditing(false)

    if (!allowAutoUpdate) {
      onUpdatedValue(event.target.value)
    }
  }

  function handleInputKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ): void {
    switch (event.key) {
      case 'Enter': {
        const target = event.target as HTMLInputElement
        onUpdatedValue(target.value)

        setIsEditing(false)

        inputEl.current?.focus()
        inputEl.current?.select()

        break
      }
      case 'Esc': // IE/Edge specific value
      case 'Escape':
        // Lose focus from input but place focus on body
        inputEl.current?.blur()
        document.body.focus()

        // Reset editing or hover state
        setIsEditing(false)
        setIsHovered(false)

        // TODO: Fix old value saved in metric, when in imperial mode
        onUpdatedValue(oldValue.current ?? '')
        break
      default:
        setIsEditing(true)
        break
    }
  }

  return (
    <div className="up-down-input">
      <Tooltip
        label={downTooltip}
        sublabel={downTooltipSublabel}
        placement="bottom"
      >
        <Button
          className="up-down-input-decrement"
          data-testid="down"
          onClick={handleClickDecrement}
          disabled={
            disabled ||
            (value !== null && minValue !== undefined
              ? value <= minValue
              : false)
          }
        >
          <Icon name="minus" />
        </Button>
      </Tooltip>
      <input
        type="text"
        className="up-down-input-element"
        title={inputTooltip}
        disabled={disabled}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        ref={inputEl}
      />
      <Tooltip
        label={upTooltip}
        sublabel={upTooltipSublabel}
        placement="bottom"
      >
        <Button
          className="up-down-input-increment"
          data-testid="up"
          onClick={handleClickIncrement}
          disabled={
            disabled ||
            (value !== null && maxValue !== undefined
              ? value >= maxValue
              : false)
          }
        >
          <Icon name="plus" />
        </Button>
      </Tooltip>
    </div>
  )
}
