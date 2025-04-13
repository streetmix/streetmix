import React from 'react'
import { FormattedMessage } from 'react-intl'

import { useDispatch } from '~/src/store/hooks'
import { showDialog } from '~/src/store/slices/dialogs'
import Icon from '~/src/ui/Icon'
import Menu, { type MenuProps } from './Menu'
import MenuItem from './MenuItem'

function ContactMenu (props: MenuProps): React.ReactElement {
  const dispatch = useDispatch()

  return (
    <Menu {...props}>
      <MenuItem href="https://strt.mx/discord">
        <Icon name="discord" className="menu-item-icon" />
        <FormattedMessage
          id="menu.contact.discord"
          defaultMessage="Join Discord chat"
        />
      </MenuItem>
      <MenuItem href="https://github.com/streetmix/streetmix/">
        <Icon name="github" className="menu-item-icon" />
        <FormattedMessage
          id="menu.contact.github"
          defaultMessage="View source code on GitHub"
        />
      </MenuItem>
      <MenuItem
        onClick={() => {
          dispatch(showDialog('NEWSLETTER'))
        }}
      >
        <Icon name="mail" className="menu-item-icon" />
        <FormattedMessage
          id="menu.contact.newsletter"
          defaultMessage="Subscribe to our newsletter"
        />
      </MenuItem>
    </Menu>
  )
}

export default ContactMenu
