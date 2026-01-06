import { useSelector } from '~/src/store/hooks.js'
import Icon from '~/src/ui/Icon.js'

interface ExternalLinkProps extends Partial<
  React.AnchorHTMLAttributes<HTMLAnchorElement>
> {
  children: React.ReactNode
  href: string
  icon?: boolean
  className?: string
}

export function ExternalLink({
  children,
  href,
  icon = false,
  ...restProps
}: ExternalLinkProps) {
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
