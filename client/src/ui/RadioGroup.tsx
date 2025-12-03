import React, { useId } from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import type {
  RadioGroupProps,
  RadioGroupItemProps,
} from '@radix-ui/react-radio-group'

import './RadioGroup.css'

// Note:
// For all other accepted props, see the Radix UI documentation at
// https://www.radix-ui.com/docs/primitives/components/radio-group
// Use Radix root API to get/set values and handle changes, for example.
export interface RadioItemProps extends RadioGroupItemProps {
  label: string
  sublabel?: string
}

interface RadioProps extends RadioGroupProps {
  values: RadioItemProps[]
}

function RadioGroup(props: RadioProps) {
  const { className = '', values, ...restProps } = props

  const classNames = ['radio-group-root']
  if (className) {
    classNames.push(className)
  }

  return (
    <RadioGroupPrimitive.Root className={classNames.join(' ')} {...restProps}>
      {values.map((props, i) => (
        <RadioGroupItem key={i} {...props} />
      ))}
    </RadioGroupPrimitive.Root>
  )
}

function RadioGroupItem({
  value,
  label,
  sublabel = '',
  disabled = false,
  required = false,
}: RadioItemProps) {
  const elementId = useId()

  return (
    <div className="radio-group-item">
      <RadioGroupPrimitive.Item
        className="radio-group-radio"
        id={elementId}
        value={value}
        disabled={disabled}
        required={required}
      >
        <RadioGroupPrimitive.Indicator className="radio-group-indicator" />
      </RadioGroupPrimitive.Item>
      <label htmlFor={elementId}>
        <span className="radio-group-label">{label}</span>
        {sublabel && <span className="radio-group-sublabel">{sublabel}</span>}
      </label>
    </div>
  )
}

export default RadioGroup
