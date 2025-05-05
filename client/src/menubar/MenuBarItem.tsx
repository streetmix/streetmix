import React, { type ButtonHTMLAttributes } from 'react'
import { FormattedMessage } from 'react-intl'

import Icon from '../ui/Icon'
import { Tooltip } from '../ui/Tooltip'

interface MenuBarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // Accepts children to render
  children?: React.ReactNode
  // Otherwise use <FormattedMessage /> to render a label
  translation?: string
  label?: string
  // Other optional props
  tooltip?: string
}

export default function MenuBarItem ({
  translation = '',
  label = '',
  tooltip,
  children = <FormattedMessage id={translation} defaultMessage={label} />,
  ...restProps
}: MenuBarItemProps): React.ReactElement {
  const component = (
    <li>
      <button className="menu-trigger" role="menuitem" {...restProps}>
        {children}
        <Icon name="chevron-down" className="menu-carat-down" />
      </button>
    </li>
  )

  if (tooltip !== undefined) {
    return (
      <Tooltip label={tooltip} placement="bottom">
        {component}
      </Tooltip>
    )
  }

  return component
}
