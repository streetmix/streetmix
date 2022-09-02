import React from 'react'
import { useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { EnvelopeClosedIcon, ExternalLinkIcon } from '@radix-ui/react-icons'
import Icon from '../ui/Icon'
import ExternalLink from '../ui/ExternalLink'
import { showDialog } from '../store/slices/dialogs'
import Menu from './Menu'

function ContactMenu (props) {
  const dispatch = useDispatch()

  return (
    <Menu {...props}>
      <ExternalLink href="https://strt.mx/discord">
        <Icon icon="discord" />
        <FormattedMessage
          id="menu.contact.discord"
          defaultMessage="Join Discord chat"
        />
        <ExternalLinkIcon className="menu-item-external-link" />
      </ExternalLink>
      <ExternalLink href="https://github.com/streetmix/streetmix/">
        <Icon icon="github" />
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
        <EnvelopeClosedIcon className="menu-item-icon-radix" />
        <FormattedMessage
          id="menu.contact.newsletter"
          defaultMessage="Subscribe to our newsletter"
        />
      </a>
    </Menu>
  )
}

export default React.memo(ContactMenu)
