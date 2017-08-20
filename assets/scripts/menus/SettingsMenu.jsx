import React from 'react'
import Menu from './Menu'
import { t, getLocale, onNewLocaleSelected } from '../app/locale'
import { trackEvent } from '../app/event_tracking'

const LOCALES = [
  {
    label: 'Chinese (Traditional)',
    value: 'zh-Hant',
    key: 'i18n.lang.zh-hant'
  },
  {
    label: 'English',
    value: 'en',
    key: 'i18n.lang.en'
  },
  {
    label: 'Finnish',
    value: 'fi',
    key: 'i18n.lang.fi'
  },
  {
    label: 'French',
    value: 'fr',
    key: 'i18n.lang.fr'
  },
  {
    label: 'German',
    value: 'de',
    key: 'i18n.lang.de'
  },
  {
    label: 'Polish',
    value: 'pl',
    key: 'i18n.lang.pl'
  },
  {
    label: 'Portuguese (Brazil)',
    value: 'pt_BR',
    key: 'i18n.lang.pt-br'
  },
  {
    label: 'Spanish',
    value: 'es',
    key: 'i18n.lang.es'
  },
  {
    label: 'Spanish (Mexico)',
    value: 'es_MX',
    key: 'i18n.lang.es-mx'
  },
  {
    label: 'Swedish',
    value: 'sv',
    key: 'i18n.lang.sv'
  }
]

export default class SettingsMenu extends React.PureComponent {
  componentDidMount () {
    // Set the dropdown to the current language.
    // If current language is not in the list, fallback to US English.
    this.localeSelect.value = getLocale()
    if (!this.localeSelect.value) {
      this.localeSelect.value = 'en'
    }
  }

  onShow () {
    trackEvent('Interaction', 'Open settings menu', null, null, false)
  }

  renderLocaleOptions () {
    return LOCALES.map(locale =>
      <option
        value={locale.value}
        key={locale.value}
        data-i18n={locale.key}
      >
        {t(locale.key, `[${locale.label}]`)}
      </option>
    )
  }

  render () {
    return (
      <Menu alignment="right" onShow={this.onShow} {...this.props}>
        <div className="form">
          <p><span data-i18n="menu.language.heading">Language</span></p>
          <select onChange={onNewLocaleSelected} ref={(ref) => { this.localeSelect = ref }}>
            {this.renderLocaleOptions()}
          </select>
        </div>
      </Menu>
    )
  }
}
