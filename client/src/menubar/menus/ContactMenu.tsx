import { FormattedMessage } from 'react-intl'

import { useDispatch } from '~/src/store/hooks.js'
import { showDialog } from '~/src/store/slices/dialogs.js'
import Icon from '~/src/ui/Icon.js'
import Menu, { type MenuProps } from './Menu.js'
import { MenuItem } from './MenuItem.js'

export function ContactMenu(props: MenuProps) {
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
