import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl, intlShape } from 'react-intl'
import { onNewLocaleSelected } from '../app/locale'
import { trackEvent } from '../app/event_tracking'

/**
 * Locale levels
 * Locales are grouped into four levels of "readiness" for production.
 *
 * 1 - Incomplete or in progress, available for translators to test, but not for end-users.
 * 2 - Complete or nearly complete, available for quality assurance & feedback with small group of users.
 * 3 - Complete and ready for production use.
 * 4 - This is a special category for the "default" locale, which is English. This should never
 *     be disabled and we don't have a special flag to toggle group 4 on or off. It's always on.
 *
 * Levels are lower bounds and inclusive. In other words, allowing level 1 means all locales
 * 1 or higher are enabled. You cannot _only_ turn on level 1 but not level 2 for example.
 */
const LOCALES = [
  {
    label: 'Arabic',
    value: 'ar',
    key: 'i18n.lang.ar',
    level: 2
  },
  {
    label: 'Chinese (Traditional)',
    value: 'zh-Hant',
    key: 'i18n.lang.zh-hant',
    level: 1
  },
  {
    label: 'English',
    value: 'en',
    key: 'i18n.lang.en',
    level: 4
  },
  {
    label: 'Finnish',
    value: 'fi',
    key: 'i18n.lang.fi',
    level: 2
  },
  {
    label: 'French',
    value: 'fr',
    key: 'i18n.lang.fr',
    level: 2
  },
  {
    label: 'German',
    value: 'de',
    key: 'i18n.lang.de',
    level: 1
  },
  {
    label: 'Japanese',
    value: 'ja',
    key: 'i18n.lang.ja',
    level: 2
  },
  {
    label: 'Polish',
    value: 'pl',
    key: 'i18n.lang.pl',
    level: 1
  },
  {
    label: 'Portuguese (Brazil)',
    value: 'pt_BR',
    key: 'i18n.lang.pt-br',
    level: 1
  },
  {
    label: 'Spanish',
    value: 'es',
    key: 'i18n.lang.es',
    level: 1
  },
  {
    label: 'Spanish (Mexico)',
    value: 'es_MX',
    key: 'i18n.lang.es-mx',
    level: 2
  },
  {
    label: 'Swedish',
    value: 'sv',
    key: 'i18n.lang.sv',
    level: 1
  }
]

export class LocaleDropdown extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    locale: PropTypes.string,
    /* eslint-disable react/no-unused-prop-types */
    // These props _are_ used but linter can't tell
    level1: PropTypes.bool.isRequired,
    level2: PropTypes.bool.isRequired,
    level3: PropTypes.bool.isRequired
    /* eslint-enable react/no-unused-prop-types */
  }

  static defaultProps = {
    level1: false,
    level2: false,
    level3: false
  }

  constructor (props) {
    super(props)

    this.state = {
      level: this.determineLevel(props)
    }
  }

  componentDidMount () {
    // Set the dropdown to the current language.
    // If current language is not in the list, fallback to US English.
    this.localeSelect.value = this.props.locale.replace('-', '_')
    if (!this.localeSelect.value) {
      this.localeSelect.value = 'en'
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ level: this.determineLevel(nextProps) })
  }

  onShow () {
    trackEvent('Interaction', 'Open settings menu', null, null, false)
  }

  determineLevel = (props) => {
    let level = 4
    if (props.level3) level = 3
    if (props.level2) level = 2
    if (props.level1) level = 1
    return level
  }

  renderLocaleOptions = () => {
    return LOCALES
      .filter((item) => item.level >= this.state.level)
      // Replace each locale with the translated label
      .map((locale) => ({
        ...locale,
        label: this.props.intl.formatMessage({
          id: locale.key,
          defaultMessage: `[${locale.label}]`
        })
      }))
      // Sort the list of languages alphabetically
      .sort((a, b) => {
        if (a.label < b.label) return -1
        if (a.label > b.label) return 1
        return 0
      })
      // Render each option
      .map((locale) => <option value={locale.value} key={locale.value}>{locale.label}</option>)
  }

  render () {
    return (
      <select onChange={onNewLocaleSelected} ref={(ref) => { this.localeSelect = ref }}>
        {this.renderLocaleOptions()}
      </select>
    )
  }
}

function mapStateToProps (state) {
  return {
    locale: state.locale.locale,
    level1: state.flags.LOCALES_LEVEL_1.value,
    level2: state.flags.LOCALES_LEVEL_2.value,
    level3: state.flags.LOCALES_LEVEL_3.value
  }
}

export default injectIntl(connect(mapStateToProps)(LocaleDropdown))
