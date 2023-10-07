import React, { useRef } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import './Switch.scss'

// This stores an incrementing number for unique IDs.
let idCounter = 1

interface SwitchProps {
  // Child nodes are wrapped in <label> when rendered.
  children: React.ReactNode

  // Class name applied to root switch element. Will be combined with
  // the default `switch-root` class name.
  className?: string

  // An `id` is associates a `label` with an `input` element. If you don't
  // provide one, the component automatically generates a unique ID. IDs
  // are "for internal use only".
  id?: string

  // Note:
  // For all other accepted props, see the Radix UI documentation at
  // https://www.radix-ui.com/docs/primitives/components/switch
  // Use Radix root API to get/set checked state, for example.
}

function Switch (props: SwitchProps): React.ReactElement {
  const { id, className, children, ...restProps } = props

  // An `id` associates a `label` with the Radix UI Switch component.
  // You can provide one manually in props, otherwise, this component
  // will generate a unique id value for each instance. Generated ids
  // are not meant to be accessed by other code or CSS selectors.
  const elementId = useRef<string | undefined>(id)
  if (elementId.current === undefined) {
    // This exists in an if statement to check if the ref value is present
    // to prevent the counter from incrementing on every render
    elementId.current = `switch-id-${idCounter++}`
  }

  const classNames = ['switch-root']
  if (className !== undefined) {
    classNames.push(className)
  }

  return (
    <div className="switch-item">
      <SwitchPrimitive.Root
        id={elementId.current}
        className={classNames.join(' ')}
        {...restProps}
      >
        <SwitchPrimitive.Thumb className="switch-thumb" />
      </SwitchPrimitive.Root>
      <label htmlFor={elementId.current}>{children}</label>
    </div>
  )
}

export default Switch
