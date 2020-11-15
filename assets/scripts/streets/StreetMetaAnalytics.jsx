import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { getStreetCapacity } from '../segments/capacity'
import { formatNumber } from '../util/number_format'
import { showDialog } from '../store/slices/dialogs'

function StreetMetaAnalytics (props) {
  const street = useSelector((state) => state.street)
  const locale = useSelector((state) => state.locale.locale)
  const dispatch = useDispatch()

  const averageCapacity = getStreetCapacity(street).average

  // If zero capacity, don't display anything
  if (averageCapacity > 0) {
    return (
      <span className="street-metadata-analytics">
        <a href="#" onClick={() => dispatch(showDialog('ANALYTICS'))}>
          <FormattedMessage
            id="capacity.ppl-per-hour"
            defaultMessage="{capacity} people/hr"
            values={{ capacity: formatNumber(averageCapacity, locale) }}
          />
        </a>
      </span>
    )
  }

  return null
}

export default StreetMetaAnalytics
