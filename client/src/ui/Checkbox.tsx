/**
 * Custom stylized checkbox component, so we control the look and
 * feel instead of relying on browser's default styles.
 */
import React, { useState, useRef, type ChangeEvent } from 'react'

import Icon from './Icon'
import './Checkbox.css'

// This stores an incrementing number for unique IDs.
let idCounter = 1

interface CheckboxProps {
  // Child nodes are wrapped in <label> when rendered.
  children: React.ReactNode

  // Initial checked state of the input.
  checked?: boolean

  // Whether or not the input is disabled. Unlike vanilla HTML, this component
  // also changes the appearance of labels of disabled checkboxes.
  disabled?: boolean

  // The value of a checkbox input can be optionally set.
  // By default, browsers set checked inputs to have a string value of "on".
  value?: string

  // The handler function that's called when the value of the input changes.
  onChange?: React.ChangeEventHandler<HTMLInputElement>

  // Class name applied to containing element
  className?: string

  // An `id` is associates a `label` with an `input` element. If you don't
  // provide one, the component automatically generates a unique ID. IDs
  // are "for internal use only".
  id?: string
}

function Checkbox (props: CheckboxProps): React.ReactElement {
  const {
    children,
    checked = false,
    disabled = false,
    value,
    onChange = () => undefined,
    id,
    className = '',

    // Remainder of props will be applied to the containing <div> element
    // for instance, `style`, data attributes, etc.
    ...restProps
  } = props

  // This is a controlled component. The `useState` hook maintains
  // this component's internal state, and sets the initial state
  // based on the `checked` prop (which is `false` by default).
  const [isChecked, setChecked] = useState(checked)

  // An `id` is required to associate a `label` with an `input` element.
  // You can provide one manually in props, otherwise, this component
  // will generate a unique id value for each instance. Generated ids
  // are not meant to be accessed by other code or CSS selectors.
  const elementId = useRef(id)
  if (elementId.current === undefined) {
    // This exists in an if statement to check if the ref value is present
    // to prevent the counter from incrementing on every render
    elementId.current = `checkbox-id-${idCounter++}`
  }

  const classNames = ['checkbox-item']
  if (className) {
    classNames.push(className)
  }

  // When the value is changed, we update the state, and we also call
  // any `onChange` handler that is provided by the parent via props.
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setChecked(!isChecked)
    onChange(event)
  }

  return (
    <div className={classNames.join(' ')} {...restProps}>
      <input
        type="checkbox"
        id={elementId.current}
        checked={isChecked}
        value={value}
        disabled={disabled}
        onChange={handleChange}
      />
      <label htmlFor={elementId.current}>{children}</label>
      {/* The visual state of this checkbox is affected by the value of the input, via CSS. */}
      <Icon name="check" />
    </div>
  )
}

export default Checkbox
