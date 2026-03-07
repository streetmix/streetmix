import { FormattedMessage } from 'react-intl'

import { formatNumber } from '../../util/number_format.js'

interface CapacityMessageProps {
  locale: string
  average: number
  potential: number
}

export function CapacityMessage({
  locale,
  average,
  potential,
}: CapacityMessageProps) {
  const isSingleAmount = average === potential
  const defaultMessage = isSingleAmount
    ? '{amount} people/hour'
    : '{average} — {potential} people/hour'
  const id = isSingleAmount
    ? 'dialogs.analytics.segment-summary-single'
    : 'dialogs.analytics.segment-summary'
  const options = {
    maximumSignificantDigits: 3,
  }

  return (
    <FormattedMessage
      id={id}
      defaultMessage={defaultMessage}
      values={{
        amount: formatNumber(average, locale, options),
        average: formatNumber(average, locale, options),
        potential: formatNumber(potential, locale, options),
      }}
    />
  )
}
