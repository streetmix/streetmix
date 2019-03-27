import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import LocaleSelect from './LocaleSelect'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../users/constants'
import { updateUnits } from '../users/localization'
import { changeLocale } from '../store/actions/locale'
import { clearMenus } from '../store/actions/menus'
import { ICON_CHECK } from '../ui/icons'

export class SettingsMenu extends React.PureComponent {
  static propTypes = {
    units: PropTypes.number,
    locale: PropTypes.string,
    localeIsLoading: PropTypes.bool,
    requestedLocale: PropTypes.string,
    enableLocaleSettings: PropTypes.bool,
    changeLocale: PropTypes.func,
    clearMenus: PropTypes.func
  }

  static defaultProps = {
    changeLocale: () => {},
    clearMenus: () => {}
  }

  componentDidUpdate (prevProps) {
    // If there was previously a requested locale and now there isn't one, assume
    // loading process for loading locale has completed; hide menu now.
    // NOTE: This is how we want things to behave but this never actually works,
    // because the menus are remounted every time the language has loaded.
    // I'm leaving it here anyway under the hopes that this code doesn't go to
    // waste when we figure out how to avoid this problem.
    if (prevProps.requestedLocale && this.props.requestedLocale === null) {
      this.props.clearMenus()
    }

    // Close menu when units have changed
    if (prevProps.units !== this.props.units) {
      this.props.clearMenus()
    }
  }

  selectLocale = (locale) => {
    if (this.props.locale === locale) return

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
            {(this.props.units === SETTINGS_UNITS_METRIC) && <FontAwesomeIcon className="menu-item-icon" icon={ICON_CHECK} />}
            {/* &#x200E; prevents trailing parentheses from going in the wrong place in rtl languages */}
            <FormattedMessage id="settings.units.metric" defaultMessage="Metric units (meters)" />&#x200E;
          </li>
          <li className={`menu-item ${(this.props.units === SETTINGS_UNITS_IMPERIAL) ? 'menu-item-selected' : ''}`} onClick={this.selectImperial}>
            {(this.props.units === SETTINGS_UNITS_IMPERIAL) && <FontAwesomeIcon className="menu-item-icon" icon={ICON_CHECK} />}
            <FormattedMessage id="settings.units.imperial" defaultMessage="Imperial units (feet)" />&#x200E;
          </li>
        </ul>

        {this.props.enableLocaleSettings && (
          <React.Fragment>
            <h2 className="menu-header">
              <FormattedMessage id="settings.language.label" defaultMessage="Language" />
            </h2>
            <LocaleSelect locale={this.props.locale} requestedLocale={this.props.requestedLocale} selectLocale={this.selectLocale} />
          </React.Fragment>
        )}
      </Menu>
    )
  }
}

function mapStateToProps (state) {
  return {
    units: state.street.units,
    locale: state.locale.locale,
    localeIsLoading: state.locale.isLoading,
    requestedLocale: state.locale.requestedLocale,
    enableLocaleSettings: state.flags.LOCALES_LEVEL_1.value || state.flags.LOCALES_LEVEL_2.value || state.flags.LOCALES_LEVEL_3.value
  }
}

function mapDispatchToProps (dispatch) {
  return {
    changeLocale: (locale) => dispatch(changeLocale(locale)),
    clearMenus: () => dispatch(clearMenus())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsMenu)
