import React from 'react'
import PropTypes from 'prop-types'
import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '../users/constants'
import { prettifyWidth } from '../util/width_units'

MeasurementText.propTypes = {
  value: PropTypes.number,
  units: PropTypes.oneOf([SETTINGS_UNITS_METRIC, SETTINGS_UNITS_IMPERIAL]),
  locale: PropTypes.string
}

function MeasurementText (props) {
  const { value, units = SETTINGS_UNITS_METRIC, locale } = props

  return <span>{prettifyWidth(value, units, locale)}</span>
}

// This component is memoized because `prettifyWidth()` can be expensive
export default React.memo(MeasurementText)
