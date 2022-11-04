import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import AccessibleIcon from './AccessibleIcon'
import './Popover.scss'

const PopoverContent = React.forwardRef(
  ({ children, ...props }, forwardedRef) => (
    <PopoverPrimitive.Content {...props} ref={forwardedRef}>
      {children}
      <PopoverPrimitive.Arrow className="popover-arrow" />
    </PopoverPrimitive.Content>
  )
)

PopoverContent.displayName = 'PopoverContent'
PopoverContent.propTypes = {
  children: PropTypes.node
}

function Popover ({ label, children }) {
  const intl = useIntl()
  const a11yLabel =
    label ||
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

Popover.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node
}

export default Popover
