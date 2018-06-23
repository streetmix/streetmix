import React from 'react'
import PropTypes from 'prop-types'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../users/constants'
import {
  getImperialMeasurementWithVulgarFractions,
  stringifyMeasurementValue
} from '../util/width_units'

export default class MeasurementText extends React.Component {
  static propTypes = {
    value: PropTypes.number,
    units: PropTypes.oneOf([SETTINGS_UNITS_METRIC, SETTINGS_UNITS_IMPERIAL]),
    locale: PropTypes.string
  }

  static defaultProps = {
    units: SETTINGS_UNITS_METRIC
  }

  /**
   * Given a measurement value, returns display text. Also converts
   * to string and does locale formatting
   *
   * @param {Number} value
   * @param {Number} units
   * @param {string} locale
   * @return {string}
   */
  getMeasurementString (value, units, locale) {
    if (units === SETTINGS_UNITS_IMPERIAL) {
      return getImperialMeasurementWithVulgarFractions(value, locale)
    } else {
      return stringifyMeasurementValue(value, SETTINGS_UNITS_METRIC, locale)
    }
  }

  render () {
    const { value, units, locale } = this.props

    return (
      <span>
        {this.getMeasurementString(value, units, locale)}
        {(units === SETTINGS_UNITS_METRIC) ? ' m' : "'" }
      </span>
    )
  }
}
