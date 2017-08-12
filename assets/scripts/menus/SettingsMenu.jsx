import React from 'react'
import Menu from './Menu'
// { t } is not currently imported / used
import { getLocale, onNewLocaleSelected } from '../app/locale'
import { trackEvent } from '../app/event_tracking'

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

  render () {
    return (
      <Menu alignment="right" onShow={this.onShow} {...this.props}>
        <div className="form">
          <p><span data-i18n="menu.language.heading">Language</span></p>
          <p>
            <select onChange={onNewLocaleSelected} ref={(ref) => { this.localeSelect = ref }}>
              <option value="zh-Hant" data-i18n="i18n.lang.zh-hant">Chinese (Traditional)</option>
              <option value="en" data-i18n="i18n.lang.en">English</option>
              <option value="fi" data-i18n="i18n.lang.fi">Finnish</option>
              <option value="fr" data-i18n="i18n.lang.fr">French</option>
              <option value="de" data-i18n="i18n.lang.de">German</option>
              <option value="pl" data-i18n="i18n.lang.pl">Polish</option>
              <option value="pt_BR" data-i18n="i18n.lang.pt-br">Portuguese (Brazil)</option>
              <option value="es" data-i18n="i18n.lang.es">Spanish</option>
              <option value="es_MX" data-i18n="i18n.lang.es-mx">Spanish (Mexico)</option>
              <option value="sv" data-i18n="i18n.lang.sv">Swedish</option>
            </select>
          </p>
        </div>
      </Menu>
    )
  }
}
