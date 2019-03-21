import React from 'react'
import PropTypes from 'prop-types'
import { SETTINGS_UNITS_IMPERIAL, SETTINGS_UNITS_METRIC } from '../users/constants'
import { prettifyWidth } from '../util/width_units'

const MeasurementText = React.memo((props) => {
  const { value, units, locale } = props

  return (
    <span>
      {prettifyWidth(value, units, locale)}
    </span>
  )
})

MeasurementText.propTypes = {
  value: PropTypes.number,
  units: PropTypes.oneOf([SETTINGS_UNITS_METRIC, SETTINGS_UNITS_IMPERIAL]),
  locale: PropTypes.string
}

MeasurementText.defaultProps = {
  units: SETTINGS_UNITS_METRIC
}

export default MeasurementText
