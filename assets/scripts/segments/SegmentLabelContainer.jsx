import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_PENCIL } from '../ui/icons'
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
      {
        (props.editable) ? (
          <span className="segment-label segment-label-editable" onClick={props.editSegmentLabel}>
            <span className="segment-label-editable-icon">
              <FontAwesomeIcon icon={ICON_PENCIL} />
            </span>
            {props.label}
          </span>
        ) : (
          <span className="segment-label">
            {props.label}
          </span>
        )
      }
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
  locale: PropTypes.string.isRequired,
  editable: PropTypes.bool,
  editSegmentLabel: PropTypes.func
}

SegmentLabelContainer.defaultProps = {
  units: SETTINGS_UNITS_METRIC,
  editable: false,
  editSegmentLabel: () => {}
}

export default SegmentLabelContainer
