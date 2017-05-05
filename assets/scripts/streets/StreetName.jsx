import React from 'react'
import PropTypes from 'prop-types'
import { needsUnicodeFont } from '../util/unicode'

const MAX_STREET_NAME_WIDTH = 50

export default class StreetName extends React.PureComponent {
  /**
   * Some processing needed to display street name
   *
   * @public for main street name ¯\_(ツ)_/¯
   * @params {string} name - Street name to check
   */
  static normalizeStreetName (name) {
    if (!name) {
      return ''
    }

    name = name.trim()

    if (name.length > MAX_STREET_NAME_WIDTH) {
      name = name.substr(0, MAX_STREET_NAME_WIDTH) + '…'
    }

    return name
  }

  render () {
    let classString = 'street-name-text ' + (!needsUnicodeFont(this.props.name) ? '' : 'fallback-unicode-font')

    return (
      <div
        ref={(ref) => { this.el = ref }}
        className='street-name'
        {...this.props}
      >
        <div className={classString}>{StreetName.normalizeStreetName(this.props.name)}</div>
      </div>
    )
  }
}

StreetName.propTypes = {
  name: PropTypes.string.isRequired
}
