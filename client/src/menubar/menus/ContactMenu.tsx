import React from 'react'
import { FormattedMessage } from 'react-intl'

import { useDispatch } from '~/src/store/hooks'
import { showDialog } from '~/src/store/slices/dialogs'
import ExternalLink from '~/src/ui/ExternalLink'
import Icon from '~/src/ui/Icon'
import Menu, { type MenuProps } from './Menu'

function ContactMenu (props: MenuProps): React.ReactElement {
  const dispatch = useDispatch()

  return (
    <Menu {...props}>
      <ExternalLink href="https://strt.mx/discord" icon={true}>
        <Icon name="discord" className="menu-item-icon" />
        <FormattedMessage
          id="menu.contact.discord"
          defaultMessage="Join Discord chat"
        />
      </ExternalLink>
      <ExternalLink href="https://github.com/streetmix/streetmix/" icon={true}>
        <Icon name="github" className="menu-item-icon" />
        <FormattedMessage
          id="menu.contact.github"
          defaultMessage="View source code on GitHub"
        />
      </ExternalLink>
      <a
        onClick={(e) => {
          dispatch(showDialog('NEWSLETTER'))
        }}
      >
        <Icon name="mail" className="menu-item-icon" />
        <FormattedMessage
          id="menu.contact.newsletter"
          defaultMessage="Subscribe to our newsletter"
        />
      </a>
    </Menu>
  )
}

export default ContactMenu
