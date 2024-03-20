import React from 'react'
import { FormattedMessage } from 'react-intl'
import { formatNumber } from '../../util/number_format'

interface CapacityMessageProps {
  locale: string
  average: number
  potential: number
}

function CapacityMessage ({
  locale,
  average,
  potential
}: CapacityMessageProps): React.ReactElement {
  const isSingleAmount = average === potential
  const defaultMessage = isSingleAmount
    ? '{amount} people/hour'
    : '{average} — {potential} people/hour'
  const id = isSingleAmount
    ? 'dialogs.analytics.segment-summary-single'
    : 'dialogs.analytics.segment-summary'
  const options = {
    maximumSignificantDigits: 3
  }

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
