import React from 'react'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import LocaleDropdown from './LocaleDropdown'

export default class SettingsMenu extends React.PureComponent {
  render () {
    return (
      <Menu alignment="right" onShow={this.onShow} {...this.props}>
        <div className="form">
          <p><FormattedMessage id="menu.language.heading" defaultMessage="Language" /></p>
          <LocaleDropdown />
        </div>
      </Menu>
    )
  }
}
