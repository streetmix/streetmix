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
  const isSingleAmount = average === potential
  const defaultMessage = isSingleAmount ? '{amount} people/hour' : '{average} — {potential} people/hour'
  const id = isSingleAmount ? 'dialogs.analytics.segment-summary-single' : 'dialogs.analytics.segment-summary'
  return (
    <FormattedMessage
      id={id}
      defaultMessage={defaultMessage}
      values={{
        amount: FormatNumber(locale, average),
        average: FormatNumber(locale, average),
        potential: FormatNumber(locale, potential)
      }}
    />)
}
