import React from 'react'
import Menu from './Menu'
import LocaleDropdown from './LocaleDropdown'

export default class SettingsMenu extends React.PureComponent {
  render () {
    return (
      <Menu alignment="right" onShow={this.onShow} {...this.props}>
        <div className="form">
          <p><span data-i18n="menu.language.heading">Language</span></p>
          <LocaleDropdown />
        </div>
      </Menu>
    )
  }
}
