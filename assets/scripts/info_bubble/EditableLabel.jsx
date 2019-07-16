import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { trackEvent } from '../app/event_tracking'
import { editSegmentLabel } from '../segments/view'
import { ICON_PENCIL, ICON_LOCK } from '../ui/icons'
import './EditableLabel.scss'

const EditableLabel = (props) => {
  const { label, segment, position, customLabelEnabled } = props

  const handleMouseEnterLabel = (event) => {
    trackEvent('Interaction', 'InoBubble: Hover over editable label', null, null, true)
  }

  const handleClick = (event) => {
    return customLabelEnabled && editSegmentLabel(segment, position)
  }

  // If position is a string, it's a building, and buildings are currently not
  // editable at all, so render a label with no interactivity
  if (typeof position === 'string') {
    return (
      <div className="info-bubble-label">
        {label}
      </div>
    )
  }

  return (
    <div
      className="info-bubble-label info-bubble-label-editable"
      onClick={handleClick}
      onMouseEnter={handleMouseEnterLabel}
    >
      {label}
      <span className="info-bubble-label-editable-icon">
        {customLabelEnabled
          ? <FontAwesomeIcon icon={ICON_PENCIL} />
          : <FontAwesomeIcon icon={ICON_LOCK} />
        }
      </span>
    </div>
  )
}

EditableLabel.propTypes = {
  // Label can be string, or React element (if translated by ReactIntl)
  label: PropTypes.node,
  segment: PropTypes.object,
  position: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf([ 'left', 'right' ])
  ]),

  // Provided by Redux mapStateToProps
  customLabelEnabled: PropTypes.bool
}

EditableLabel.defaultProps = {
  customLabelEnabled: false
}

function mapStateToProps (state) {
  return {
    customLabelEnabled: state.flags.CUSTOM_SEGMENT_LABELS.value
  }
}

export default connect(mapStateToProps)(EditableLabel)
