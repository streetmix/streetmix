import React, { type ButtonHTMLAttributes } from 'react'

interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

function MenuItem ({
  children,
  className,
  ...props
}: MenuItemProps): React.ReactElement {
  // Merge classnames
  const classNames = ['menu-item']
  if (typeof className === 'string') {
    classNames.push(className)
  }

  return (
    <button className={classNames.join(' ')} role="menuitem" {...props}>
      {children}
    </button>
  )
}

export default MenuItem
