import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { FormatNumber } from '../../util/formatting'

CapacityMessage.propTypes = {
  pctAverage: PropTypes.number.isRequired,
  pctPotential: PropTypes.number.isRequired,
  locale: PropTypes.string.isRequired,
  average: PropTypes.number.isRequired,
  potential: PropTypes.number.isRequired
}

function CapacityMessage ({
  locale,
  average,
  potential,
  pctAverage,
  pctPotential
}) {
  const isSingleAmount = average === potential
  const defaultMessage = isSingleAmount
    ? '{amount} people/hour ({pctAverage}% - {pctPotential}%)'
    : '{average} — {potential} people/hour ({pctAverage}% - {pctPotential}%)'
  const id = isSingleAmount
    ? 'dialogs.analytics.segment-summary-single'
    : 'dialogs.analytics.segment-summary'

  return (
    <FormattedMessage
      id={id}
      defaultMessage={defaultMessage}
      values={{
        pctAverage: FormatNumber(locale, pctAverage),
        pctPotential: FormatNumber(locale, pctPotential),
        amount: FormatNumber(locale, average),
        average: FormatNumber(locale, average),
        potential: FormatNumber(locale, potential)
      }}
    />
  )
}

export default CapacityMessage
