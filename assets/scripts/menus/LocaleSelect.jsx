import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage } from 'react-intl'
import { DEFAULT_LOCALE } from '../locales/constants'
import { getAvailableLocales, getActualLocaleFromRequested } from '../locales/locale'
import { ICON_CHECK } from '../ui/icons'

export default class LocaleSelect extends React.Component {
  static propTypes = {
    locale: PropTypes.string,
    requestedLocale: PropTypes.string,
    selectLocale: PropTypes.func
  }

  static defaultProps = {
    locale: DEFAULT_LOCALE,
    selectLocale: () => {}
  }

  renderLocaleOptions = () => {
    const filteredLocales = getAvailableLocales()
    const actuallySelectedLocale = getActualLocaleFromRequested(this.props.locale)

    // Render each option
    return filteredLocales.map((locale) => {
      const classNames = ['menu-item']

      if (locale.value === actuallySelectedLocale) {
        classNames.push('menu-item-selected')
      }

      if (locale.value === this.props.requestedLocale) {
        classNames.push('menu-item-loading')
      }

      return (
        <li className={classNames.join(' ')} key={locale.value} onClick={(event) => this.props.selectLocale(locale.value)}>
          {(locale.value === actuallySelectedLocale) && <FontAwesomeIcon className="menu-item-icon" icon={ICON_CHECK} />}
          {/* &#x200E; prevents trailing parentheses from going in the wrong place in rtl languages */}
          <span>{locale.label}&#x200E;</span>
          <span className="menu-item-subtext">
            <FormattedMessage id={locale.key} defaultMessage={locale.name} />
          </span>
        </li>
      )
    })
  }

  render () {
    return (
      <ul className="menu-item-group">
        {this.renderLocaleOptions()}
      </ul>
    )
  }
}
