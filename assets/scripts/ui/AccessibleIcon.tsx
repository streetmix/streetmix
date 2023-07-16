import React from 'react'
import * as AccessibleIconPrimitive from '@radix-ui/react-accessible-icon'

type Props = AccessibleIconPrimitive.AccessibleIconProps

export default function AccessibleIcon (props: Props): React.ReactElement {
  return <AccessibleIconPrimitive.Root {...props} />
}
