import React from 'react'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import LocaleDropdown from './LocaleDropdown'

export default class SettingsMenu extends React.PureComponent {
  render () {
    return (
      <Menu onShow={this.onShow} {...this.props}>
        <h2 className="menu-header">
          <FormattedMessage id="settings.units.heading" defaultMessage="Units" />
        </h2>
        <ul className="menu-item-group" onChange={this.onChange} ref={(ref) => { this.localeSelect = ref }}>
          <li className="menu-item menu-item-selected">
            <FormattedMessage id="settings.units.metric" defaultMessage="Metric units (meters)" />
          </li>
          <li className="menu-item">
            <FormattedMessage id="settings.units.imperial" defaultMessage="Imperial units (feet)" />
          </li>
        </ul>

        <h2 className="menu-header">
          <FormattedMessage id="menu.language.heading" defaultMessage="Language" />
        </h2>
        <LocaleDropdown />
      </Menu>
    )
  }
}
