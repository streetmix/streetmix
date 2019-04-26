import React from 'react'
import PropTypes from 'prop-types'
import MeasurementText from '../ui/MeasurementText'
import { SETTINGS_UNITS_METRIC } from '../users/constants'
import './SegmentLabelContainer.scss'

const SegmentLabelContainer = (props) => {
  const gridClassNames = ['segment-grid']

  // Add class names for measurement grid marks
  if (props.units === SETTINGS_UNITS_METRIC) {
    gridClassNames.push('units-metric')
  } else {
    gridClassNames.push('units-imperial')
  }

  return (
    <div className="segment-label-container">
      <span className="segment-label">
        {props.label}
      </span>
      <span className="segment-width">
        <MeasurementText
          value={props.width}
          units={props.units}
          locale={props.locale}
        />
      </span>
      <span className={gridClassNames.join(' ')} />
    </div>
  )
}

SegmentLabelContainer.propTypes = {
  // Label can be a string or a React element, e.g. <FormattedMessage />.
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]).isRequired,
  width: PropTypes.number.isRequired,
  units: PropTypes.number,
  locale: PropTypes.string.isRequired
}

SegmentLabelContainer.defaultProps = {
  units: SETTINGS_UNITS_METRIC
}

export default SegmentLabelContainer
