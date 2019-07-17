import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import {
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL,
  SEGMENT_WARNING_WIDTH_TOO_LARGE
} from '../segments/constants'

const Warnings = (props) => {
  const { segment } = props
  const messages = []

  if (!segment || !segment.warnings) return null

  if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
    messages.push(
      <FormattedMessage
        id="segments.warnings.does-not-fit"
        defaultMessage="This segment doesn’t fit within the street."
      />
    )
  }
  if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL]) {
    messages.push(
      <FormattedMessage
        id="segments.warnings.not-wide"
        defaultMessage="This segment might not be wide enough."
      />
    )
  }
  if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]) {
    messages.push(
      <FormattedMessage
        id="segments.warnings.too-wide"
        defaultMessage="This segment might be too wide."
      />
    )
  }

  if (messages.length > 0) {
    return (
      <div className="info-bubble-warnings">
        {messages.map((message) => (<p key={message.props.id}>{message}</p>))}
      </div>
    )
  }

  return null
}

Warnings.propTypes = {
  segment: PropTypes.shape({
    warnings: PropTypes.arrayOf(PropTypes.bool)
  })
}

export default Warnings
