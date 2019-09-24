import React from 'react'
import PropTypes from 'prop-types'
import { FormatNumber } from '../../util/formatting'
import { FormattedMessage } from 'react-intl'

CapacityMessage.propTypes = {
  locale: PropTypes.string.isRequired,
  average: PropTypes.number.isRequired,
  potential: PropTypes.number.isRequired
}

export default function CapacityMessage ({ locale, average, potential }) {
  if (average === potential) {
    return (<FormattedMessage
      id="dialogs.analytics.segment-summary-single"
      defaultMessage="{amount} people/hour"
      values={{
        amount: FormatNumber(locale, average)
      }}
    />)
  }

  return (<FormattedMessage
    id="dialogs.analytics.segment-summary"
    defaultMessage="{average} — {potential} people/hour"
    values={{
      average: FormatNumber(locale, average),
      potential: FormatNumber(locale, potential)
    }}
  />)
}
