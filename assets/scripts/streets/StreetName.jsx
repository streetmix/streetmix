import React from 'react'
import PropTypes from 'prop-types'
import { needsUnicodeFont } from '../util/unicode'

const MAX_STREET_NAME_WIDTH = 50

export default class StreetName extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string
  }

  static defaultProps = {
    name: ''
  }

  /**
   * Some processing needed to display street name
   *
   * @public for main street name ¯\_(ツ)_/¯
   * @params {string} name - Street name to check
   */
  static normalizeStreetName (name) {
    if (!name) return ''

    name = name.trim()

    if (name.length > MAX_STREET_NAME_WIDTH) {
      name = name.substr(0, MAX_STREET_NAME_WIDTH) + '…'
    }

    return name
  }

  /**
   * For a parent component that needs to know the dimensions of this component
   */
  getBoundingClientRect () {
    return this.el.getBoundingClientRect()
  }

  render () {
    let classString = 'street-name-text ' + (!needsUnicodeFont(this.props.name) ? '' : 'fallback-unicode-font')

    return (
      <div className="street-name" ref={(ref) => { this.el = ref }} {...this.props}>
        <div className={classString}>{StreetName.normalizeStreetName(this.props.name)}</div>
      </div>
    )
  }
}
