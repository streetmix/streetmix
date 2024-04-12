import React from 'react'
import { useSelector } from '../store/hooks'

interface ExternalLinkProps {
  children: React.ReactNode
  href: string
  className?: string
}

function ExternalLink ({
  children,
  href,
  ...restProps
}: ExternalLinkProps): React.ReactElement {
  const offline = useSelector((state) => state.system.offline)

  if (offline) {
    return <>{children}</>
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...restProps}>
      {children}
    </a>
  )
}

export default ExternalLink
