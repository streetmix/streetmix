import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { showDialog } from '~/src/store/slices/dialogs'
import ExternalLink from '~/src/ui/ExternalLink'
import Icon from '~/src/ui/Icon'
import { registerKeypress, deregisterKeypress } from '~/src/app/keypress'
import Menu, { type MenuProps } from './Menu'
import MenuItem from './MenuItem'
import MenuSeparator from './MenuSeparator'
import KeyboardShortcuts from './KeyboardShortcuts'

function HelpMenu (props: MenuProps): React.ReactElement {
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
        <Icon name="rocket" className="menu-item-icon" />
        <FormattedMessage
          id="menu.item.whatsnew"
          defaultMessage="What’s new?&lrm;"
        />
      </MenuItem>
      {!offline && (
        <>
          <ExternalLink
            href="https://docs.streetmix.net/user-guide/intro"
            icon={true}
          >
            <Icon name="trail-sign" className="menu-item-icon" />
            <FormattedMessage
              id="menu.help.guidebook-link"
              defaultMessage="Guidebook"
            />
          </ExternalLink>
          <MenuSeparator />
          <ExternalLink
            href="https://cottonbureau.com/people/streetmix"
            icon={true}
          >
            <Icon name="cart" className="menu-item-icon" />
            <FormattedMessage id="menu.item.store" defaultMessage="Store" />
          </ExternalLink>
        </>
      )}
      <MenuSeparator />
      <KeyboardShortcuts />
    </Menu>
  )
}

export default HelpMenu
