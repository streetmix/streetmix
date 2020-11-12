import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { getStreetCapacity } from '../util/street_analytics'
import { formatNumber } from '../util/number_format'
import { showDialog } from '../store/slices/dialogs'

function StreetMetaAnalytics (props) {
  const street = useSelector((state) => state.street)
  const locale = useSelector((state) => state.locale.locale)
  const dispatch = useDispatch()

  const averageTotal = getStreetCapacity(street).averageTotal

  // If zero capacity, don't display anything
  if (averageTotal > 0) {
    return (
      <span className="street-metadata-analytics">
        <a href="#" onClick={() => dispatch(showDialog('ANALYTICS'))}>
          <FormattedMessage
            id="capacity.ppl-per-hour"
            defaultMessage="{capacity} people/hr"
            values={{ capacity: formatNumber(averageTotal, locale) }}
          />
        </a>
      </span>
    )
  }

  return null
}

export default StreetMetaAnalytics
