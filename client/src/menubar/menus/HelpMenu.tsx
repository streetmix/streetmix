import { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { showDialog } from '~/src/store/slices/dialogs.js'
import Icon from '~/src/ui/Icon.js'
import { registerKeypress, deregisterKeypress } from '~/src/app/keypress.js'
import Menu, { type MenuProps } from './Menu.js'
import { MenuItem } from './MenuItem.js'
import { MenuSeparator } from './MenuSeparator.js'
import { KeyboardShortcuts } from './KeyboardShortcuts.js'

export function HelpMenu(props: MenuProps) {
  const offline = useSelector((state) => state.system.offline)
  const dispatch = useDispatch()

  useEffect(() => {
    // Set up keyboard shortcuts
    registerKeypress('?', { shiftKey: 'optional' }, () =>
      dispatch(showDialog('ABOUT'))
    )

    return () => {
      deregisterKeypress('?', () => dispatch(showDialog('ABOUT')))
    }
  })

  return (
    <Menu {...props}>
      <MenuItem onClick={() => dispatch(showDialog('ABOUT'))}>
        <Icon name="info" className="menu-item-icon" />
        <FormattedMessage
          id="menu.item.about"
          defaultMessage="About Streetmix…"
        />
      </MenuItem>
      <MenuItem onClick={() => dispatch(showDialog('WHATS_NEW'))}>
        <Icon name="whats-new" className="menu-item-icon" />
        <FormattedMessage
          id="menu.item.whatsnew"
          defaultMessage="What’s new?&lrm;"
        />
      </MenuItem>
      {!offline && (
        <>
          <MenuItem href="https://docs.streetmix.net/user-guide/intro">
            <Icon name="trail-sign" className="menu-item-icon" />
            <FormattedMessage
              id="menu.help.guidebook-link"
              defaultMessage="Guidebook"
            />
          </MenuItem>
          <MenuSeparator />
          <MenuItem href="https://cottonbureau.com/people/streetmix">
            <Icon name="cart" className="menu-item-icon" />
            <FormattedMessage id="menu.item.store" defaultMessage="Store" />
          </MenuItem>
        </>
      )}
      <MenuSeparator />
      <KeyboardShortcuts />
    </Menu>
  )
}
