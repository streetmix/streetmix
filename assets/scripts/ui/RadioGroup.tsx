import React, { useRef } from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import './RadioGroup.scss'

// This stores an incrementing number for unique IDs.
let idCounter = 1

interface RadioGroupProps {
  // Class name applied to root switch element. Will be combined with
  // the default `switch-root` class name.
  className?: string

  // An `id` is associates a `label` with an `input` element. If you don't
  // provide one, the component automatically generates a unique ID. IDs
  // are "for internal use only".
  id?: string

  // Values are array of objects that specify what the options should be
  values: Array<{
    value: string
    label: string
    sublabel?: string
    disabled?: boolean
    required?: boolean
  }>

  // Note:
  // For all other accepted props, see the Radix UI documentation at
  // https://www.radix-ui.com/docs/primitives/components/radio-group
  // Use Radix root API to get/set values and handle changes, for example.
}

interface RadioGroupItemProps {
  id: string
  value: string
  label: string
  sublabel?: string
  disabled?: boolean
  required?: boolean
}

function RadioGroup (props: RadioGroupProps): React.ReactElement {
  const { id, className = '', values, ...restProps } = props

  // An `id` associates a `label` with the Radix UI RadioGroup component.
  // You can provide one manually in props, otherwise, this component
  // will generate a unique id value for each instance. Generated ids
  // are not meant to be accessed by other code or CSS selectors.
  const elementId = useRef(id)
  const idValue = elementId.current ?? `radio-group-id-${idCounter++}`
  if (elementId.current === undefined) {
    // This exists in an if statement to check if the ref value is present
    // to prevent the counter from incrementing on every render
    elementId.current = `radio-group-id-${idCounter++}`
  }

  const classNames = ['radio-group-root']
  if (className) {
    classNames.push(className)
  }

  return (
    <RadioGroupPrimitive.Root className={classNames.join(' ')} {...restProps}>
      {values.map((props, i) => (
        <RadioGroupItem
          key={`${idValue}_${i}`}
          id={`${idValue}_${i}`}
          {...props}
        />
      ))}
    </RadioGroupPrimitive.Root>
  )
}

function RadioGroupItem ({
  id,
  value,
  label,
  sublabel = '',
  disabled = false,
  required = false
}: RadioGroupItemProps): React.ReactElement {
  return (
    <div className="radio-group-item">
      <RadioGroupPrimitive.Item
        className="radio-group-radio"
        id={id}
        value={value}
        disabled={disabled}
        required={required}
      >
        <RadioGroupPrimitive.Indicator className="radio-group-indicator" />
      </RadioGroupPrimitive.Item>
      <label htmlFor={id}>
        <span className="radio-group-label">{label}</span>
        {sublabel && <span className="radio-group-sublabel">{sublabel}</span>}
      </label>
    </div>
  )
}

export default RadioGroup
