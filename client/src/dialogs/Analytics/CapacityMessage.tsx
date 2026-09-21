import { FormattedMessage } from 'react-intl'
import { formatNumber } from '@streetmix/utils'

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

  const intlProps = isSingleAmount
    ? {
        id: 'dialogs.analytics.segment-summary-single',
        defaultMessage: '{amount} people/hour',
      }
    : {
        id: 'dialogs.analytics.segment-summary',
        defaultMessage: '{average} — {potential} people/hour',
      }
  const options = {
    maximumSignificantDigits: 3,
  }

  return (
    <FormattedMessage
      {...intlProps}
      values={{
        amount: formatNumber(average, locale, options),
        average: formatNumber(average, locale, options),
        potential: formatNumber(potential, locale, options),
      }}
    />
  )
}
