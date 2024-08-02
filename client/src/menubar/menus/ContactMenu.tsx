import React from 'react'
import { FormattedMessage } from 'react-intl'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { IoMailOutline } from 'react-icons/io5'

import Icon from '../../ui/Icon'
import ExternalLink from '../../ui/ExternalLink'
import { useDispatch } from '../../store/hooks'
import { showDialog } from '../../store/slices/dialogs'
import Menu, { type MenuProps } from './Menu'

function ContactMenu (props: MenuProps): React.ReactElement {
  const dispatch = useDispatch()

  return (
    <Menu {...props}>
      <ExternalLink href="https://strt.mx/discord">
        <Icon icon="discord" className="menu-item-icon" />
        <FormattedMessage
          id="menu.contact.discord"
          defaultMessage="Join Discord chat"
        />
        <ExternalLinkIcon className="menu-item-external-link" />
      </ExternalLink>
      <ExternalLink href="https://github.com/streetmix/streetmix/">
        <Icon icon="github" className="menu-item-icon" />
        <FormattedMessage
          id="menu.contact.github"
          defaultMessage="View source code on GitHub"
        />
        <ExternalLinkIcon className="menu-item-external-link" />
      </ExternalLink>
      <a
        onClick={(e) => {
          dispatch(showDialog('NEWSLETTER'))
        }}
      >
        <IoMailOutline className="menu-item-icon-io5" />
        <FormattedMessage
          id="menu.contact.newsletter"
          defaultMessage="Subscribe to our newsletter"
        />
      </a>
    </Menu>
  )
}

export default ContactMenu
