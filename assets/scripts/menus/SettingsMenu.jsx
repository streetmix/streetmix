import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import LocaleDropdown from './LocaleDropdown'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../users/constants'
import { updateUnits } from '../users/localization'
import { changeLocale } from '../store/actions/locale'
import { clearMenus } from '../store/actions/menus'

class SettingsMenu extends React.PureComponent {
  static propTypes = {
    units: PropTypes.number,
    locale: PropTypes.string,
    changeLocale: PropTypes.func,
    clearMenus: PropTypes.func,
    level1: PropTypes.bool.isRequired,
    level2: PropTypes.bool.isRequired,
    level3: PropTypes.bool.isRequired
  }

  static defaultProps = {
    level1: false,
    level2: false,
    level3: false
  }

  selectLocale = (locale) => {
    if (this.props.locale === locale) return

    this.props.clearMenus()
    this.props.changeLocale(locale)
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
    // The lowest level marked "true" takes priority.
    let level = 4
    if (this.props.level3) level = 3
    if (this.props.level2) level = 2
    if (this.props.level1) level = 1

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
        <LocaleDropdown locale={this.props.locale} level={level} selectLocale={this.selectLocale} />
      </Menu>
    )
  }
}

function mapStateToProps (state) {
  return {
    units: state.street.units,
    locale: state.locale.locale,
    level1: state.flags.LOCALES_LEVEL_1.value,
    level2: state.flags.LOCALES_LEVEL_2.value,
    level3: state.flags.LOCALES_LEVEL_3.value
  }
}

function mapDispatchToProps (dispatch) {
  return {
    changeLocale: (locale) => dispatch(changeLocale(locale)),
    clearMenus: () => dispatch(clearMenus())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsMenu)
