import React from 'react'
import PropTypes from 'prop-types'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../users/constants'
import { prettifyWidth } from '../util/width_units'

export default function MeasurementText (props) {
  const { value, units, locale } = props

  return (
    <span>
      {prettifyWidth(value, units, locale)}
    </span>
  )
}

MeasurementText.prototype.propTypes = {
  value: PropTypes.number,
  units: PropTypes.oneOf([SETTINGS_UNITS_METRIC, SETTINGS_UNITS_IMPERIAL]),
  locale: PropTypes.string
}

MeasurementText.prototype.defaultProps = {
  units: SETTINGS_UNITS_METRIC
}
