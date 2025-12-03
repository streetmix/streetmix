import React, { forwardRef } from 'react'
import { useIntl } from 'react-intl'
import * as PopoverPrimitive from '@radix-ui/react-popover'

import AccessibleIcon from './AccessibleIcon'
import Icon from './Icon'

import type { PopoverContentProps } from '@radix-ui/react-popover'
import './Popover.css'

interface PopoverProps {
  label?: string
  children: React.ReactElement
}

const PopoverContent = forwardRef(
  (
    { children, ...props }: PopoverContentProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => (
    <PopoverPrimitive.Content {...props} ref={ref}>
      {children}
      <PopoverPrimitive.Arrow className="popover-arrow" />
    </PopoverPrimitive.Content>
  )
)

PopoverContent.displayName = 'PopoverContent'

function Popover({ label, children }: PopoverProps) {
  const intl = useIntl()
  const a11yLabel =
    label ??
    intl.formatMessage({
      id: 'settings.info-tooltip',
      defaultMessage: 'Description',
    })

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button className="popover-trigger">
          <AccessibleIcon label={a11yLabel}>
            <Icon name="info" />
          </AccessibleIcon>
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverContent
        side="top"
        collisionPadding={10}
        arrowPadding={6}
        className="popover-content"
      >
        {children}
      </PopoverContent>
    </PopoverPrimitive.Root>
  )
}

export default Popover
