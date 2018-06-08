import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import LocaleDropdown from './LocaleDropdown'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../users/constants'
import { updateUnits } from '../users/localization'

class SettingsMenu extends React.PureComponent {
  static propTypes = {
    units: PropTypes.number,
    locale: PropTypes.string
  }

  selectMetric = () => {
    if (this.props.units === SETTINGS_UNITS_METRIC) return

    updateUnits(SETTINGS_UNITS_METRIC)
  }

  selectImperial = () => {
    if (this.props.units === SETTINGS_UNITS_IMPERIAL) return

    updateUnits(SETTINGS_UNITS_IMPERIAL)
  }

  render () {
    return (
      <Menu onShow={this.onShow} {...this.props}>
        <h2 className="menu-header">
          <FormattedMessage id="settings.units.heading" defaultMessage="Units" />
        </h2>
        <ul className="menu-item-group">
          <li className={`menu-item ${(this.props.units === SETTINGS_UNITS_METRIC) ? 'menu-item-selected' : ''}`} onClick={this.selectMetric}>
            <FormattedMessage id="settings.units.metric" defaultMessage="Metric units (meters)" />
          </li>
          <li className={`menu-item ${(this.props.units === SETTINGS_UNITS_IMPERIAL) ? 'menu-item-selected' : ''}`} onClick={this.selectImperial}>
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

function mapStateToProps (state) {
  return {
    units: state.street.units,
    locale: state.locale.locale
  }
}

export default connect(mapStateToProps)(SettingsMenu)
