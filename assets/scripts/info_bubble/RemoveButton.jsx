import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { removeSegment, removeAllSegments } from '../segments/remove'
import { ICON_TRASH } from '../ui/icons'
import './RemoveButton.scss'

RemoveButton.propTypes = {
  segment: PropTypes.number.isRequired
}

function RemoveButton ({ segment = null }) {
  const intl = useIntl()

  const handleClick = (event) => {
    // Prevent this “leaking” to a segment below
    event.preventDefault()

    // Power move: a shift key will remove all segments
    if (event.shiftKey) {
      removeAllSegments()
    } else {
      // Otherwise, remove one segment
      removeSegment(segment)
    }
  }

  // Bail if segment is not provided; do not check for falsy. 0 is valid value for segment
  if (typeof segment === 'undefined' || segment === null) return null

  return (
    <button
      className="info-bubble-remove"
      tabIndex={-1}
      title={intl.formatMessage({
        id: 'tooltip.remove-segment',
        defaultMessage: 'Remove segment'
      })}
      onClick={handleClick}
    >
      <FontAwesomeIcon icon={ICON_TRASH} className="remove-icon" />
      <FormattedMessage id="btn.remove" defaultMessage="Remove" />
    </button>
  )
}

export default RemoveButton
