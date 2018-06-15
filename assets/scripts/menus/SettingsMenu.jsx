import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import LocaleSelect from './LocaleSelect'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../users/constants'
import { updateUnits } from '../users/localization'
import { changeLocale } from '../store/actions/locale'
import { clearMenus } from '../store/actions/menus'

export class SettingsMenu extends React.PureComponent {
  static propTypes = {
    units: PropTypes.number,
    locale: PropTypes.string,
    changeLocale: PropTypes.func,
    clearMenus: PropTypes.func
  }

  static defaultProps = {
    changeLocale: () => {},
    clearMenus: () => {}
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
    return (
      <Menu onShow={this.onShow} {...this.props}>
        <h2 className="menu-header">
          <FormattedMessage id="settings.units.label" defaultMessage="Units" />
        </h2>
        <ul className="menu-item-group">
          <li className={`menu-item ${(this.props.units === SETTINGS_UNITS_METRIC) ? 'menu-item-selected' : ''}`} onClick={this.selectMetric}>
            {/* &#x200E; prevents trailing parentheses from going in the wrong place in rtl languages */}
            <FormattedMessage id="settings.units.metric" defaultMessage="Metric units (meters)" />&#x200E;
          </li>
          <li className={`menu-item ${(this.props.units === SETTINGS_UNITS_IMPERIAL) ? 'menu-item-selected' : ''}`} onClick={this.selectImperial}>
            <FormattedMessage id="settings.units.imperial" defaultMessage="Imperial units (feet)" />&#x200E;
          </li>
        </ul>

        <h2 className="menu-header">
          <FormattedMessage id="settings.language.label" defaultMessage="Language" />
        </h2>
        <LocaleSelect locale={this.props.locale} selectLocale={this.selectLocale} />
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

function mapDispatchToProps (dispatch) {
  return {
    changeLocale: (locale) => dispatch(changeLocale(locale)),
    clearMenus: () => dispatch(clearMenus())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsMenu)
