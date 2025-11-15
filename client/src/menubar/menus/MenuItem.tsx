import React from 'react'

import ExternalLink from '~/src/ui/ExternalLink'

// TODO: fix broken types, `href` means render `a`, otherwise render `button`
type MenuItemProps<T extends 'button' | 'a'> = {
  href?: string
  children: React.ReactNode
} & React.JSX.IntrinsicElements[T]

function MenuItem<T extends 'button' | 'a'> ({
  href,
  className,
  children,
  ...props
}: MenuItemProps<T>): React.ReactElement {
  // Merge classnames
  const classNames = ['menu-item']
  if (typeof className === 'string') {
    classNames.push(className)
  }

  if (href !== undefined) {
    return (
      <ExternalLink
        href={href}
        icon
        className={classNames.join(' ')}
        role="menuitem"
        {...props}
      >
        {children}
      </ExternalLink>
    )
  }

  return (
    <button className={classNames.join(' ')} role="menuitem" {...props}>
      {children}
    </button>
  )
}

export default MenuItem
