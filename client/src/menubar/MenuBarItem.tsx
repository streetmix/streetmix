import React from 'react'
import { FormattedMessage } from 'react-intl'
import { ChevronDownIcon, ExternalLinkIcon } from '@radix-ui/react-icons'

import type { PassthroughProps } from '~/src/types'
import ExternalLink from '../ui/ExternalLink'
import Tooltip from '../ui/Tooltip'
import { isUrlExternal } from '../util/helpers'

interface MenuBarItemProps {
  // Accepts children to render
  children?: React.ReactNode
  // If URL is provided, renders using anchor tags intead of buttons
  url?: string
  // Otherwise, uses a <FormattedMessage /> component to render menu label
  translation?: string
  label?: string
  // Other optional props
  tooltip?: string
  target?: string
  onClick?: (event: React.MouseEvent) => void
}

export default function MenuBarItem ({
  translation = '',
  label = '',
  tooltip,
  url,
  children = <FormattedMessage id={translation} defaultMessage={label} />,
  ...restProps
}: MenuBarItemProps | PassthroughProps): React.ReactElement {
  let component

  if (typeof url === 'string') {
    if (isUrlExternal(url)) {
      component = (
        <li>
          <ExternalLink href={url} {...restProps}>
            {children}
            <ExternalLinkIcon className="menu-external-link" />
          </ExternalLink>
        </li>
      )
    } else {
      component = (
        <li>
          <a href={url} {...restProps}>
            {children}
            <ExternalLinkIcon className="menu-external-link" />
          </a>
        </li>
      )
    }
  } else {
    component = (
      <li>
        <button className="menu-attached" {...restProps}>
          {children}
          <ChevronDownIcon className="menu-carat-down" />
        </button>
      </li>
    )
  }

  if (tooltip !== undefined) {
    return (
      <Tooltip label={tooltip} placement="bottom">
        {component}
      </Tooltip>
    )
  }

  return component
}
