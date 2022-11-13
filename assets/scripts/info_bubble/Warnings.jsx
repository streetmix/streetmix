import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import {
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL,
  SEGMENT_WARNING_WIDTH_TOO_LARGE,
  SEGMENT_WARNING_DANGEROUS_EXISTING
} from '../segments/constants'
import alertIcon from '../../images/warning_alert.svg'
import errorIcon from '../../images/warning_error.svg'

const Warnings = (props) => {
  const { segment } = props
  const messages = []

  if (!segment || !segment.warnings) return null

  if (segment.warnings[SEGMENT_WARNING_DANGEROUS_EXISTING]) {
    messages.push({
      type: 'alert',
      message: (
        <FormattedMessage
          id="segments.warnings.dangerous"
          defaultMessage="This segment represents a dangerous existing condition."
        />
      )
    })
  }
  if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
    messages.push({
      type: 'error',
      message: (
        <FormattedMessage
          id="segments.warnings.does-not-fit"
          defaultMessage="This segment doesn’t fit within the street."
        />
      )
    })
  }
  if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL]) {
    messages.push({
      type: 'error',
      message: (
        <FormattedMessage
          id="segments.warnings.not-wide"
          defaultMessage="This segment might not be wide enough."
        />
      )
    })
  }
  if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]) {
    messages.push({
      type: 'error',
      message: (
        <FormattedMessage
          id="segments.warnings.too-wide"
          defaultMessage="This segment might be too wide."
        />
      )
    })
  }

  if (messages.length > 0) {
    return (
      <div className="info-bubble-warnings">
        <ul>
          {messages.map((item) => {
            let icon
            switch (item.type) {
              case 'alert':
                icon = <img src={alertIcon} alt="" />
                break
              case 'error':
              default:
                icon = <img src={errorIcon} alt="" />
                break
            }

            return (
              <li
                key={item.message.props.id}
                className={`info-bubble-warning-${item.type}`}
              >
                {icon} {item.message}
              </li>
            )
          })}
        </ul>
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
