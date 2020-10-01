import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import ExternalLink from '../ui/ExternalLink'
import { isExternalUrl } from '../util/helpers'

MenuBarItem.propTypes = {
  // Accepts children to render
  children: PropTypes.any,

  // If URL is provided, renders using anchor tags intead of buttons
  url: PropTypes.string,

  // Otherwise, uses a <FormattedMessage /> component to render menu label
  translation: PropTypes.string,
  label: PropTypes.string,

  // Event handlers
  onClick: PropTypes.func
}

export default function MenuBarItem (props) {
  const {
    translation = '',
    label = '',
    url,
    onClick = () => {},
    dispatch,
    ...restProps
  } = props

  const children = props.children || (
    <FormattedMessage id={translation} defaultMessage={label} />
  )

  if (url) {
    if (isExternalUrl(url)) {
      return (
        <li>
          <ExternalLink href={url} onClick={onClick} {...restProps}>
            {children}
          </ExternalLink>
        </li>
      )
    } else {
      return (
        <li>
          <a href={url} onClick={onClick} {...restProps}>
            {children}
          </a>
        </li>
      )
    }
  } else {
    return (
      <li>
        <button className="menu-attached" onClick={onClick} {...restProps}>
          {children}
        </button>
      </li>
    )
  }
}
