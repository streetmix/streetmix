import React from 'react'
import { useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import Icon from '../ui/Icon'
import ExternalLink from '../ui/ExternalLink'
import { showDialog } from '../store/slices/dialogs'

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
      </ExternalLink>
      <ExternalLink href="https://github.com/streetmix/streetmix/">
        <Icon icon="github" />
        <FormattedMessage
          id="menu.contact.github"
          defaultMessage="View source code on GitHub"
        />
      </ExternalLink>
      <a
        href="#"
        onClick={(e) => {
          dispatch(showDialog('NEWSLETTER'))
        }}
      >
        <FormattedMessage
          id="menu.contact.newsletter"
          defaultMessage="Subscribe to our newsletter"
        />
      </a>
      {/* <ExternalLink
        href="https://forums.streetmix.net/"
      >
        <Icon icon="forums" />
        <FormattedMessage
          id="menu.contact.forums"
          defaultMessage="Discuss on the forums"
        />
      </ExternalLink>
      <ExternalLink
        href="https://twitter.com/intent/tweet?text=@streetmix"
      >
        <Icon icon="twitter" />
        <FormattedMessage
          id="menu.contact.twitter"
          defaultMessage="Send a tweet to @streetmix"
        />
      </ExternalLink> */}
    </Menu>
  )
}

export default React.memo(ContactMenu)
