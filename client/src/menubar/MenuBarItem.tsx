import { type ButtonHTMLAttributes } from 'react'

import { Icon } from '../ui/Icon'
import { Tooltip } from '../ui/Tooltip'

interface MenuBarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // Accepts children to render
  children?: React.ReactNode
  // Other optional props
  tooltip?: string
}

export function MenuBarItem({
  tooltip,
  children = <></>,

  // Additional props are passed to the <button> element
  ...restProps
}: MenuBarItemProps) {
  const component = (
    <li>
      <button className="menu-trigger" {...restProps}>
        {children}
        <Icon name="chevron-down" size="14" className="menu-carat-down" />
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
