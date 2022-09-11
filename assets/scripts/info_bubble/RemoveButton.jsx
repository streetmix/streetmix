import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import { removeSegment, removeAllSegments } from '../segments/remove'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
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
    <Button
      className="info-bubble-remove"
      tabIndex={-1}
      title={intl.formatMessage({
        id: 'tooltip.remove-segment',
        defaultMessage: 'Remove segment'
      })}
      onClick={handleClick}
    >
      <Icon icon="trash" className="remove-icon" />
      <FormattedMessage id="btn.remove" defaultMessage="Remove" />
    </Button>
  )
}

export default RemoveButton
