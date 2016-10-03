import React from 'react'
import Menu from './Menu'
// import { t } from '../app/locale'
import { onSignOutClick } from '../users/authentication'

export default class IdentityMenu extends React.PureComponent {
  render () {
    return (
      <Menu name='identity' {...this.props}>
        <a href='#' data-i18n='menu.item.sign-out' onClick={onSignOutClick}>
          Sign out
        </a>
      </Menu>
    )
  }
}
