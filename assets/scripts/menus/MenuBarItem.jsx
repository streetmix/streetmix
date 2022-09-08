import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { ChevronDownIcon, ExternalLinkIcon } from '@radix-ui/react-icons'
import ExternalLink from '../ui/ExternalLink'
import Tooltip from '../ui/Tooltip'
import { isExternalUrl } from '../util/helpers'

MenuBarItem.propTypes = {
  // Accepts children to render
  children: PropTypes.any,

  // If URL is provided, renders using anchor tags intead of buttons
  url: PropTypes.string,

  // Otherwise, uses a <FormattedMessage /> component to render menu label
  translation: PropTypes.string,
  label: PropTypes.string,

  // Tooltip string (optional)
  tooltip: PropTypes.string,

  // Event handlers
  onClick: PropTypes.func
}

export default function MenuBarItem (props) {
  const {
    translation = '',
    label = '',
    tooltip,
    url,
    onClick = () => {},
    ...restProps
  } = props

  const children = props.children || (
    <FormattedMessage id={translation} defaultMessage={label} />
  )

  let component
  if (url) {
    if (isExternalUrl(url)) {
      component = (
        <li>
          <ExternalLink href={url} onClick={onClick} {...restProps}>
            {children}
            <ExternalLinkIcon className="menu-external-link" />
          </ExternalLink>
        </li>
      )
    } else {
      component = (
        <li>
          <a href={url} onClick={onClick} {...restProps}>
            {children}
            <ExternalLinkIcon className="menu-external-link" />
          </a>
        </li>
      )
    }
  } else {
    component = (
      <li>
        <button className="menu-attached" onClick={onClick} {...restProps}>
          {children}
          <ChevronDownIcon className="menu-carat-down" />
        </button>
      </li>
    )
  }

  if (tooltip) {
    return (
      <Tooltip label={tooltip} placement="bottom">
        {component}
      </Tooltip>
    )
  }

  return component
}
