import React from 'react'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import { onSignOutClick } from '../users/authentication'

export default class IdentityMenu extends React.PureComponent {
  render () {
    return (
      <Menu {...this.props}>
        <a href="#" onClick={onSignOutClick}>
          <FormattedMessage id="menu.item.sign-out" defaultMessage="Sign out" />
        </a>
      </Menu>
    )
  }
}
