import React, { useId } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import type { SwitchProps } from '@radix-ui/react-switch'

import './Switch.css'

function Switch (props: SwitchProps): React.ReactElement {
  const { className, children, ...restProps } = props

  // Generate an `id` to associate a `label` with an `input` element.
  const elementId = useId()

  const classNames = ['switch-root']
  if (className !== undefined) {
    classNames.push(className)
  }

  return (
    <div className="switch-item">
      <SwitchPrimitive.Root
        id={elementId}
        className={classNames.join(' ')}
        {...restProps}
      >
        <SwitchPrimitive.Thumb className="switch-thumb" />
      </SwitchPrimitive.Root>
      {children && <label htmlFor={elementId}>{children}</label>}
    </div>
  )
}

export default Switch
