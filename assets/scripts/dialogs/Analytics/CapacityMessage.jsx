import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { formatNumber } from '../../util/number_format'

CapacityMessage.propTypes = {
  locale: PropTypes.string.isRequired,
  average: PropTypes.number.isRequired,
  potential: PropTypes.number.isRequired
}

function CapacityMessage ({ locale, average, potential }) {
  const isSingleAmount = average === potential
  const defaultMessage = isSingleAmount
    ? '{amount} people/hour'
    : '{average} — {potential} people/hour'
  const id = isSingleAmount
    ? 'dialogs.analytics.segment-summary-single'
    : 'dialogs.analytics.segment-summary'
  const options = { maximumSignificantDigits: 3 }

  return (
    <FormattedMessage
      id={id}
      defaultMessage={defaultMessage}
      values={{
        amount: formatNumber(average, locale, options),
        average: formatNumber(average, locale, options),
        potential: formatNumber(potential, locale, options)
      }}
    />
  )
}

export default CapacityMessage
