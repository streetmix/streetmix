import React from 'react'
import Menu from './Menu'
import { t } from '../app/locale'
import { onSignOutClick } from '../users/authentication'

export default class IdentityMenu extends React.PureComponent {
  render () {
    return (
      <Menu {...this.props}>
        <a href="#" onClick={onSignOutClick}>
          {t('menu.item.sign-out', 'Sign out')}
        </a>
      </Menu>
    )
  }
}
