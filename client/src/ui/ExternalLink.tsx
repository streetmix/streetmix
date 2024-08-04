import React from 'react'

import { useSelector } from '~/src/store/hooks'
import Icon from '~/src/ui/Icon'

interface ExternalLinkProps
  extends Partial<React.AnchorHTMLAttributes<HTMLAnchorElement>> {
  children: React.ReactNode
  href: string
  icon?: boolean
  className?: string
}

function ExternalLink ({
  children,
  href,
  icon = false,
  ...restProps
}: ExternalLinkProps): React.ReactElement {
  const offline = useSelector((state) => state.system.offline)

  if (offline) {
    return <>{children}</>
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...restProps}>
      {children}
      {icon && <Icon name="external-link" />}
    </a>
  )
}

export default ExternalLink
