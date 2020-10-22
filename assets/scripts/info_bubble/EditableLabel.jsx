import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { editSegmentLabel } from '../segments/view'
import { ICON_PENCIL, ICON_LOCK } from '../ui/icons'
import {
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from '../segments/constants'
import './EditableLabel.scss'

EditableLabel.propTypes = {
  // Label can be string, or React element (if translated by ReactIntl)
  label: PropTypes.node,
  segment: PropTypes.object,
  position: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf([BUILDING_LEFT_POSITION, BUILDING_RIGHT_POSITION])
  ])
}

function EditableLabel (props) {
  const { label, segment, position } = props
  const customLabelEnabled = useSelector(
    (state) => state.flags.CUSTOM_SEGMENT_LABELS.value || false
  )

  const handleClick = (event) => {
    return customLabelEnabled && editSegmentLabel(segment, position)
  }

  // If position is a string, it's a building, and buildings are currently not
  // editable at all, so render a label with no interactivity
  if (typeof position === 'string') {
    return <div className="info-bubble-label">{label}</div>
  }

  return (
    <div
      className="info-bubble-label info-bubble-label-editable"
      onClick={handleClick}
    >
      {label}
      <span className="info-bubble-label-editable-icon">
        {customLabelEnabled ? (
          <FontAwesomeIcon icon={ICON_PENCIL} />
        ) : (
          <FontAwesomeIcon icon={ICON_LOCK} />
        )}
      </span>
    </div>
  )
}

export default EditableLabel
