import React, { forwardRef } from 'react'
import { useIntl } from 'react-intl'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import AccessibleIcon from './AccessibleIcon'
import type { PopoverContentProps } from '@radix-ui/react-popover'
import './Popover.scss'

interface PopoverProps {
  label?: string
  children: React.ReactElement
}

const PopoverContent = forwardRef(
  (
    { children, ...props }: PopoverContentProps,
    ref: React.Ref<HTMLDivElement>
  ) => (
    <PopoverPrimitive.Content {...props} ref={ref}>
      {children}
      <PopoverPrimitive.Arrow className="popover-arrow" />
    </PopoverPrimitive.Content>
  )
)

PopoverContent.displayName = 'PopoverContent'

function Popover ({ label, children }: PopoverProps): React.ReactElement {
  const intl = useIntl()
  const a11yLabel =
    label ??
    intl.formatMessage({
      id: 'settings.info-tooltip',
      defaultMessage: 'Description'
    })

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild={true}>
        <button className="popover-trigger">
          <AccessibleIcon label={a11yLabel}>
            <InfoCircledIcon />
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
