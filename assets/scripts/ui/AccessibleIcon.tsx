import React from 'react'
import type { AccessibleIconProps } from '@radix-ui/react-accessible-icon'
import * as AccessibleIconPrimitive from '@radix-ui/react-accessible-icon'

export default function AccessibleIcon (
  props: AccessibleIconProps
): React.ReactElement {
  return <AccessibleIconPrimitive.Root {...props} />
}
