import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import MeasurementText from '../ui/MeasurementText'
import { SETTINGS_UNITS_METRIC } from '../users/constants'
import { formatCapacity } from '../util/street_analytics'
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
      {props.showCapacity && <span className="segment-capacity">
        <FormattedMessage
          id="capacity.ppl-per-hr"
          defaultMessage="{capacity} people/hr"
          values={{
            capacity: formatCapacity(props.capacity, props.locale)
          }} />
      </span>}
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
  showCapacity: PropTypes.bool,
  capacity: PropTypes.number,
  width: PropTypes.number.isRequired,
  units: PropTypes.number,
  locale: PropTypes.string.isRequired
}

SegmentLabelContainer.defaultProps = {
  units: SETTINGS_UNITS_METRIC,
  showCapacity: false
}

export default SegmentLabelContainer
