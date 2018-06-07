import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { changeLocale } from '../store/actions/locale'
import { trackEvent } from '../app/event_tracking'
import LOCALES from '../../../app/data/locales.json'

const DEFAULT_LOCALE = 'en'

export class LocaleDropdown extends React.Component {
  static propTypes = {
    locale: PropTypes.string,
    changeLocale: PropTypes.func,
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
      level: null
    }
  }

  static getDerivedStateFromProps (nextProps) {
    // The lowest level marked "true" takes priority.
    let level = 4
    if (nextProps.level3) level = 3
    if (nextProps.level2) level = 2
    if (nextProps.level1) level = 1

    return { level }
  }

  componentDidMount () {
    // Set the dropdown to the current language.
    // If current language is not in the list, fallback to US English.
    this.localeSelect.value = this.props.locale
    if (!this.localeSelect.value) {
      this.localeSelect.value = 'en'
    }
  }

  onShow () {
    trackEvent('Interaction', 'Open settings menu', null, null, false)
  }

  onChange = (event) => {
    this.props.changeLocale(event.target.value)
  }

  renderLocaleOptions = () => {
    return LOCALES
      // Remove languages that aren't enabled
      .filter((item) => item.level >= this.state.level)
      // Sort the list of languages alphabetically
      .sort((a, b) => {
        if (a.label < b.label) return -1
        if (a.label > b.label) return 1
        return 0
      })
      // Render each option
      .map((locale) => {
        const classNames = ['menu-item']
        let isSelected = false

        // Determine which one is the active one
        if (locale.value === DEFAULT_LOCALE || locale.value === this.props.locale) {
          isSelected = true
        }

        if (isSelected) {
          classNames.push('menu-item-selected')
        }

        return (
          <li className={classNames.join(' ')} value={locale.value} key={locale.value}>
            <span>{locale.label}</span>
            <span className="menu-item-subtext">
              <FormattedMessage id="locale.key" defaultMessage={locale.name} />
            </span>
          </li>
        )
      })
  }

  render () {
    return (
      <ul className="menu-item-group" onChange={this.onChange} ref={(ref) => { this.localeSelect = ref }}>
        {this.renderLocaleOptions()}
      </ul>
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

function mapDispatchToProps (dispatch) {
  return {
    changeLocale: (locale) => dispatch(changeLocale(locale))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LocaleDropdown)
